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
    // serviceType?: ManagerType; // Service Type
    public?: boolean; // Only 'public' services are exposed in the client API
    parameters?: string;
    paramsSchema?: any; // Schema Validator for Service input parameters
    // paramsSchemaValidator?: ISchemaValidator; // Schema Validator function for Service input parameters
    requestCert?: boolean; // Request to renegotiate for a Client Certificate
    server?: string; // Internal use to set the remote server where de service is allocated
    // renderer?: (response: GenericObject, lang: string | string[] | undefined) => string | undefined;
    requestManager?: CoreRequestManager | CoreRequestManager[];
    interceptor?: CoreRequestInterceptor | CoreRequestInterceptor[];
    // responseManager?: ResponseManager | ResponseManager[];
    // proxy?: ServiceProxyOptions; // Proxy Options. 'target' is required
    proxyContext?: string; // Proxy Context. default is the same service path
    excludeFromReplicas?: boolean; // Exclude this service from remote replicas
    // serviceState?: ServiceState; // Stateless / Statefull
    // policy?: PolicyChecker | PolicyChecker[]; // Service Policy Checker
    meta?: Record<string, any>; // Aditional service metadata
    // cacheConfig?: CacheConfig;
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
    init: () => Promise<void>;
    globalRequestManager?: CoreRequestManager | CoreRequestManager[]; //| Record<string, CoreRequestManager>
    globalInterceptor?: CoreRequestInterceptor | CoreRequestInterceptor[]; //| Record<string, CoreRequestInterceptor>
    requestManager?: CoreRequestManager | CoreRequestManager[]; //| Record<string, CoreRequestManager>
    interceptor?: CoreRequestInterceptor | CoreRequestInterceptor[]; //| Record<string, CoreRequestInterceptor>
}
export class CoreModule {
    constructor(
        public name: string,
        public services: Record<string, CoreService>,
        public options?: CoreModuleOptions,
    ) {}
}
export abstract class CoreRequest {
    public params: Record<string, any>;
    public remoteAddress: string | string[] | undefined;
    public origin: 'http' | 'ws';
    public headers: IncomingHttpHeaders;
    constructor() {
        // console.log(req.body);
        this.params = {};
    }
    public abstract get session();
    public abstract redirect(url: string, status?: number);
    public abstract sendFile(absolutePath: string, mimeType: string);
}
export type CoreRequestManager = (
    request: CoreRequest,
    service: CoreService,
) => CoreRequest | Promise<CoreRequest> | void;
export type CoreRequestInterceptor = (
    request: CoreRequest,
    service: CoreService,
) => Record<string, any> | Promise<Record<string, any>> | boolean | Promise<boolean> | void;
