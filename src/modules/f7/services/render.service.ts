import { CoreService, CoreRequest, ServiceManager } from '@core';
import { readFileSync, existsSync } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename));
const APP_PATH = '/f7app';
const TEMPLATE_EXT = 'hbs';
const MODULE_PATH = 'modules/f7/templates';
const NOT_FOUND_TEMPLATE = `404.${TEMPLATE_EXT}`;

async function transformer(response: any, request: CoreRequest, service: ServiceManager) {
    const subpath = request.params['*'] ?? '';

    const templatePath = subpath.split('/').slice(0, -1).join('/');
    let templateName = subpath.split('/').slice(-1)[0];
    if (!templateName || templateName === '') templateName = 'index';

    let fullTemplatePath = path.resolve(__dirname, MODULE_PATH, templatePath, `${templateName}.${TEMPLATE_EXT}`);
    if (!existsSync(fullTemplatePath)) fullTemplatePath = path.resolve(__dirname, MODULE_PATH, NOT_FOUND_TEMPLATE);

    const content = readFileSync(fullTemplatePath, 'utf-8');
    const template = Handlebars.compile(content);

    const data = {
        config: {
            path: APP_PATH,
            templateName,
        },
        params: { ...request.params },
        response: { ...response },
        meta: { ...service.meta },
    };

    if (templateName.endsWith('.js')) {
        request.setContentType('application/javascript');
    } else {
        request.setContentType('text/html');
    }
    return template(data);
}
export const home = new CoreService(
    {
        get: APP_PATH,
        transformer,
        meta: {
            public: true,
            limit: 5,
        },
    },
    async (request) => {
        // Accede a la sesión (asegúrate de que el plugin está registrado)
        const session = request.session as any;
        return request.params;
        // Incrementa el contador de visitas
    },
);
export const subpath = new CoreService(
    {
        get: `${APP_PATH}/*`,
        transformer,
        meta: {
            public: true,
            limit: 5,
        },
    },
    async (request) => {
        // Accede a la sesión (asegúrate de que el plugin está registrado)
        const session = request.session as any;
        return request.params;
        // Incrementa el contador de visitas
    },
);
