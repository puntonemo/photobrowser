import Fastify, { FastifyRegister } from 'fastify';
import {
    CoreEngine,
    CoreModule,
    CoreRequest,
    CoreRequestInterceptor,
    CoreResponseTransformer,
    CoreService,
} from './core';
import { FastifySessionObject } from '@fastify/session';
import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { UnauthorizedResponseError } from './responseError';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reactApp: FastifyPluginAsync = async (app) => {
    console.log('🔄 Iniciando FastifyStatic', path.join(__dirname, 'client'));
    await app.register(fastifyStatic, {
        root: path.join(__dirname, 'client'),
        prefix: '/',
    });

    app.setNotFoundHandler((_req, reply) => {
        reply.type('text/html').sendFile('index.html');
    });
};

export class CoreFastifyRequest extends CoreRequest {
    constructor(
        public req: FastifyRequest,
        public res: FastifyReply,
    ) {
        super();
        this.remoteAddress = req.ip;
        this.origin = 'http';
        this.headers = req.headers;
        if (req.body)
            for (const [key, value] of Object.entries(req.body as Record<string, any>)) {
                this.params[key] = value;
            }
        if (req.query)
            for (const [key, value] of Object.entries(req.query as Record<string, any>)) {
                this.params[key] = value;
            }
        if (req.params)
            for (const [key, value] of Object.entries(req.params as Record<string, any>)) {
                this.params[key] = value;
            }
    }
    public get session(): FastifySessionObject {
        return this.req.session;
    }
    public redirect(url: string, status?: number) {
        this.res.redirect(url, status ?? 302);
    }
    public sendFile(absolutePath: string, mimeType: string) {
        this.res.header('Content-Type', mimeType);

        const stream = createReadStream(absolutePath);

        // Manejar errores del stream para evitar enviar respuesta duplicada
        stream.on('error', (err) => {
            this.req.log.error(err);
            if (!this.res.raw.headersSent) {
                this.res.code(500).send({ error: 'Error al leer el archivo' });
            }
        });

        return this.res.send(stream);
    }
    public setContentType(mimeType: string) {
        this.res.header('Content-Type', mimeType);
    }
    public setHeader(header: string, value: string) {
        this.res.header(header, value);
    }
    public setCode(statusCode: number) {
        this.res.code(statusCode);
    }
}

export class FastifyEngine extends CoreEngine {
    private _serviceDict: Record<string, CoreService> = {};
    private _moduleDict: Record<string, CoreModule> = {};
    private interceptors: CoreRequestInterceptor[];
    private transformers: CoreResponseTransformer[];

    public register: FastifyRegister = () => {};
    constructor(private fastify?: FastifyInstance) {
        super();
        this.fastify = fastify || Fastify();
        this.register = this.fastify.register;
        this.interceptors = [];
        this.transformers = [];
    }

    private registerService(module: CoreModule, name: string, coreService: CoreService) {
        if (!this.fastify) return;
        coreService.manager.serviceName = name;
        coreService.manager.moduleName = module.name;
        this._serviceDict[name] = coreService;
        if (coreService.manager.get) {
            console.log(module.name, name, 'get', coreService.manager.get);
            this.fastify.get(coreService.manager.get, async (req, rep) => this.handler(req, rep, coreService));
        }
        if (coreService.manager.post) {
            console.log(module.name, name, 'post', coreService.manager.post);
            this.fastify.post(coreService.manager.post, async (req, rep) => this.handler(req, rep, coreService));
        }
        if (coreService.manager.put) {
            console.log(module.name, name, 'put', coreService.manager.put);
            this.fastify.put(coreService.manager.put, async (req, rep) => this.handler(req, rep, coreService));
        }
        if (coreService.manager.patch) {
            console.log(module.name, name, 'patch', coreService.manager.patch);
            this.fastify.patch(coreService.manager.patch, async (req, rep) => this.handler(req, rep, coreService));
        }
        if (coreService.manager.delete) {
            console.log(module.name, name, 'delete', coreService.manager.delete);
            this.fastify.delete(coreService.manager.delete, async (req, rep) => this.handler(req, rep, coreService));
        }
    }
    private registerServices(module: CoreModule, services: Record<string, CoreService>) {
        for (const service of Object.entries(services)) {
            if (service[1].constructor.name === CoreService.name) this.registerService(module, service[0], service[1]);
        }
    }
    public async registerInterceptor(requestInterceptor: CoreRequestInterceptor | CoreRequestInterceptor[]) {
        const interceptors = Array.isArray(requestInterceptor) ? requestInterceptor : [requestInterceptor];
        for (const interceptor of interceptors) this.interceptors.push(interceptor);
    }
    public async registerTransformer(requestTransformer: CoreResponseTransformer | CoreResponseTransformer[]) {
        const transformers = Array.isArray(requestTransformer) ? requestTransformer : [requestTransformer];
        for (const transformer of transformers) {
            this.transformers.push(transformer);
        }
    }
    public async registerModule(module: CoreModule) {
        this._moduleDict[module.name] = module;
        if (module.options?.services) this.registerServices(module, module.options.services);

        if (module.options?.init) await module.options.init(this);

        /** MANAGE GLOBAL INTERCEPTORS */
        if (module.options?.globalInterceptor) this.registerInterceptor(module.options.globalInterceptor);

        /** MANAGE GLOBAL TRANSFORMERS */
        if (module.options?.globalTransformer) this.registerTransformer(module.options?.globalTransformer);
    }
    public async registerReactApp(appPath = '/app') {
        if (!this.fastify) return;

        await this.fastify.register(reactApp, { prefix: appPath });
        await this.fastify.get(appPath, (_req, reply) => {
            reply.redirect(`${appPath}/`);
        });
        await this.fastify.get('/', (_req, reply) => {
            reply.redirect(`${appPath}/`);
        });
        console.log(`✅ Frontend serving at ${appPath}/`);
    }
    public async staticApp(folder: string, route: string) {
        if (!this.fastify) return;
        console.log('🔄 Iniciando staticApp', path.join(__dirname), folder, route);
        this.fastify.register(fastifyStatic, {
            root: path.join(__dirname, '..', 'dist', folder),
            prefix: `${route}/`, // ruta pública
            decorateReply: false,
        });
        await this.fastify.get(route, (_req, reply) => {
            reply.redirect(`${route}/`);
        });
    }
    public async start() {
        if (!this.fastify) return;
        try {
            const PORT = +(process.env.PORT ?? 3000);
            const HOST = process.env.HOST ?? '0.0.0.0';
            await this.fastify.listen({ port: PORT, host: HOST });
            console.log(`Servidor escuchando en ${HOST}:${PORT}`);
        } catch (err) {
            this.fastify.log.error(err);

            process.exit(1);
        }
    }
    private async handler(req: FastifyRequest, rep: FastifyReply, service: CoreService) {
        let response: Record<string, any> | undefined | void = undefined;
        const module = service.manager.moduleName ? this._moduleDict[service.manager.moduleName] : undefined;

        if (!module) console.warn(`MODULE '${service.manager.moduleName}' NOT FOUND!`);

        const frequest = new CoreFastifyRequest(req, rep);

        /** MANAGE GLOBAL INTERCEPTORS */
        for (const interceptor of this.interceptors) {
            if (response) break;
            //frequest is passed ByRef, so any change in the interceptor will be reflected here
            const interceptorResponse = await interceptor(frequest, service);

            if (interceptorResponse === true) continue;
            if (interceptorResponse === false) {
                response = UnauthorizedResponseError();
                break;
            }
            response = interceptorResponse;
        }

        /** MANAGE MODULE INTERCEPTORS */
        if (module && module.options?.interceptor) {
            const interceptors = Array.isArray(module.options.interceptor)
                ? module.options.interceptor
                : [module.options.interceptor];

            for (const interceptor of interceptors) {
                if (response) break;
                //frequest is passed ByRef, so any change in the interceptor will be reflected here
                const interceptorResponse = await interceptor(frequest, service);
                if (interceptorResponse === true) continue;
                if (interceptorResponse === false) {
                    response = UnauthorizedResponseError();
                    break;
                }
                response = interceptorResponse;
            }
        }

        /** MANAGE SERVICE INTERCEPTORS */
        if (service.manager.interceptor) {
            const interceptors = Array.isArray(service.manager.interceptor)
                ? service.manager.interceptor
                : [service.manager.interceptor];
            for (const interceptor of interceptors) {
                if (response) break;
                //frequest is passed ByRef, so any change in the interceptor will be reflected here
                const interceptorResponse = await interceptor(frequest, service);
                if (interceptorResponse === true) continue;
                if (interceptorResponse === false) {
                    response = UnauthorizedResponseError();
                    break;
                }
                response = interceptorResponse;
            }
        }

        /** SERVICE MANAGER WHEN NO RESPONSE ALREADY */
        if (!response)
            response = await service.manager(frequest).catch((error) => {
                return error;
            });

        /** MANAGE GLOBAL TRANSFORMERS */
        for (const transformer of this.transformers) {
            response = (await transformer(response!, frequest, service)) ?? response;
        }

        /** MANAGE MODULE INTERCEPTORS */
        if (module && module.options?.transformer) {
            const transformers = Array.isArray(module.options.transformer)
                ? module.options.transformer
                : [module.options.transformer];
            for (const transformer of transformers) {
                response = (await transformer(response!, frequest, service)) ?? response;
            }
        }

        /** MANAGE SERVICE INTERCEPTORS */
        if (service.manager?.transformer) {
            const transformers = Array.isArray(service.manager.transformer)
                ? service.manager.transformer
                : [service.manager.transformer];
            for (const transformer of transformers) {
                response = (await transformer(response!, frequest, service)) ?? response;
            }
        }

        if (response && response['result'] && response['result'] == 'error') {
            rep.code(response['status'] || 500).send(response);
        } else {
            if (response) return response;
        }
        return;
    }
}
