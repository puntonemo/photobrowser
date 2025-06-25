import { IncomingHttpHeaders } from 'http';

export interface ServiceManager extends ServiceManagerOptions {
    (request: CoreRequest): Promise<Record<string, any>>;
}
export interface ServiceManagerOptions {
    description?: string; // Service Description
    path?: string; // Local path for 'static' services
    get?: string; // Route to GET method
    post?: string; // Route to POST method
    put?: string; // Route to PUT method
    patch?: string; // Route to PATCH method
    delete?: string; // Route to DELETE method
    all?: string; // Route to ALL methods
    use?: string; // Route to USE method
    public?: boolean; // Only 'public' services are exposed in the client API
    parameters?: string;
    paramsSchema?: any; // Schema Validator for Service input parameters
    // paramsSchemaValidator?: ISchemaValidator; // Schema Validator function for Service input parameters
    requestCert?: boolean; // Request to renegotiate for a Client Certificate
    server?: string; // Internal use to set the remote server where de service is allocated
    interceptor?: CoreRequestInterceptor | CoreRequestInterceptor[];
    transformer?: CoreResponseTransformer | CoreResponseTransformer[];
    // proxy?: ServiceProxyOptions; // Proxy Options. 'target' is required
    proxyContext?: string; // Proxy Context. default is the same service path
    excludeFromReplicas?: boolean; // Exclude this service from remote replicas

    meta?: Record<string, any>; // Aditional service metadata
    serviceName?: string;
    moduleName?: string;
}

export class CoreService {
    public manager: ServiceManager;
    constructor(fn: (request: CoreRequest) => Promise<unknown>, options: ServiceManagerOptions);
    constructor(
        fn: (request: CoreRequest, service: ServiceManagerOptions) => Promise<unknown>,
        options: ServiceManagerOptions,
    );
    constructor(
        fn: (request: CoreRequest, service: ServiceManagerOptions) => Promise<unknown>,
        options?: ServiceManagerOptions,
    );
    constructor(
        options: ServiceManagerOptions,
        fn?: (request: CoreRequest, service: ServiceManagerOptions) => Promise<unknown>,
    );
    constructor(arg1: any, arg2: any) {
        let service: ServiceManager;
        let options: ServiceManagerOptions;
        if (typeof arg1 === 'function') {
            service = arg1 as ServiceManager;
            options = arguments[1];
        } else {
            service = (arg2 as ServiceManager) ?? function () {};
            options = arguments[0];
        }
        for (const option of Object.keys(options).filter((i) => i !== 'name')) {
            service[option] = options[option];
        }

        this.manager = service;
    }
}
interface CoreModuleOptions {
    services?: Record<string, CoreService>;
    init?: (engine: CoreEngine) => Promise<void>;
    globalInterceptor?: CoreRequestInterceptor | CoreRequestInterceptor[]; //| Record<string, CoreRequestInterceptor>
    interceptor?: CoreRequestInterceptor | CoreRequestInterceptor[]; //| Record<string, CoreRequestInterceptor>
    globalTransformer?: CoreResponseTransformer | CoreResponseTransformer[];
    transformer?: CoreResponseTransformer | CoreResponseTransformer[];
}
export class CoreModule {
    constructor(
        public name: string,
        public options?: CoreModuleOptions,
    ) {}
}
export abstract class CoreRequest {
    public params: Record<string, any>;
    public remoteAddress: string | string[] | undefined;
    public origin: 'http' | 'ws';
    public headers: IncomingHttpHeaders;
    public auth: any;
    constructor() {
        // console.log(req.body);
        this.params = {};
    }
    public abstract get session();
    public abstract redirect(url: string, status?: number);
    public abstract sendFile(absolutePath: string, mimeType: string);
    public abstract setContentType(mimeType: string);
    public abstract setHeader(header: string, value: string);
    public abstract setCode(statusCode: number);
}

export abstract class CoreEngine {
    public abstract registerInterceptor(requestInterceptor: CoreRequestInterceptor | CoreRequestInterceptor[]);
    public abstract registerTransformer(requestTransformer: CoreResponseTransformer | CoreResponseTransformer[]);
    public abstract registerModule(module: CoreModule);
    public abstract registerReactApp(appPath: string);
    public abstract staticApp(folder: string, route: string);
}

export type CoreRequestInterceptor = (
    request: CoreRequest,
    service: CoreService,
) => Record<string, any> | Promise<Record<string, any>> | boolean | Promise<boolean> | void;

export type CoreResponseTransformer = (
    response: any,
    request: CoreRequest,
    service: CoreService,
) => any | Promise<any>;
