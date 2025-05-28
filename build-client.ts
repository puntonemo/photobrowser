// build-client.ts
import dotenv from 'dotenv';
import fs from 'fs';

import { build } from 'esbuild';
import path from 'path';
import { promises as fse } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, 'src/client');
const outDir = path.resolve(__dirname, 'dist/client');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const envSpecific = path.resolve(__dirname, `.env.${process.env.NODE_ENV}`);
if (fs.existsSync(envSpecific)) {
    dotenv.config({ path: envSpecific, override: true });
}

async function buildReactApp() {
    await build({
        entryPoints: [path.join(rootDir, 'main.tsx')],
        bundle: true,
        outdir: outDir,
        sourcemap: true,
        minify: true,
        format: 'esm',
        target: ['esnext'],
        jsx: 'automatic',
        loader: {
            '.ts': 'ts',
            '.tsx': 'tsx',
            '.css': 'css',
        },
        define: {
            'import.meta.env.CLIENT_BASE_URL': JSON.stringify(process.env.CLIENT_BASE_URL || '/app'),
            'import.meta.env.CONFIG_NAME': JSON.stringify(process.env.CONFIG_NAME || 'dev'),
        },
    });

    // Copiar index.html
    await fse.copyFile(path.join(rootDir, 'index.html'), path.join(outDir, 'index.html'));

    console.log('✅ Frontend compilado en dist/client');
}

(async () => {
    try {
        await buildReactApp().catch((err) => {
            console.error(err);
            process.exit(1);
        });
        console.log('✅ Tailwind compilado correctamente');
    } catch (err) {
        console.error('❌ Error compilando Tailwind:', err);
        process.exit(1);
    }
})();
