import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

export function renderTemplateFromFile(templateName: string, data: Record<string, unknown>, language = 'es'): string {
    // __dirname en ESM
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const fullTemplatePath = path.resolve(__dirname, 'modules/auth/templates', language, `${templateName}.hbs`);
        const content = readFileSync(fullTemplatePath, 'utf-8');
        const template = Handlebars.compile(content);
        return template(data);
    } catch (error) {
        console.error('renderTemplateFromFile', error);
        return `Error rendering template '${templateName}': ${error}`;
    }
}
