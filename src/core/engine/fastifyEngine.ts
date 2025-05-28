import Fastify, { FastifyRegister } from 'fastify';
import { CoreModule, CoreRequest, CoreService } from './core';
import { FastifySessionObject } from '@fastify/session';
import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
}

export class FastifyEngine {
    private _serviceDict: Record<string, CoreService> = {};
    public register: FastifyRegister = () => {};
    constructor(private fastify?: FastifyInstance) {
        this.fastify = fastify || Fastify();
        this.register = this.fastify.register;
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
    async registerModule(module: CoreModule) {
        this.registerServices(module, module.services);
        if (module.options?.init) {
            await module.options.init();
        }
    }
    async registerReactApp(appPath = '/app') {
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

    async start() {
        if (!this.fastify) return;
        try {
            await this.fastify.listen({ port: 3000, host: '0.0.0.0' });
            console.log(`Servidor escuchando en http://localhost:3000`);
        } catch (err) {
            this.fastify.log.error(err);

            process.exit(1);
        }
    }
    private async handler(req: FastifyRequest, rep: FastifyReply, service: CoreService) {
        const frequest = new CoreFastifyRequest(req, rep);
        const response = await service.manager(frequest).catch((error) => {
            rep.code(500).send(error);
            return;
        });
        if (response['result'] && response['result'] == 'error') {
            rep.code(response['status'] || 500).send(response);
        } else {
            return response;
        }
    }
}
