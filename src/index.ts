import cookie from '@fastify/cookie';
import session from '@fastify/session';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FastifyEngine } from '@core';
import { testModule } from '@modules/test';
import { authModule } from '@modules/auth';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const envSpecific = path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV}`);
if (fs.existsSync(envSpecific)) {
    dotenv.config({ path: envSpecific, override: true });
}

const fastifyEngine = new FastifyEngine();

fastifyEngine.register(cookie);
fastifyEngine.register(session, {
    secret: 'a-very-secret-key-that-should-be-long',
    cookie: { secure: false }, // solo para dev
});
await fastifyEngine.registerModule(testModule);
await fastifyEngine.registerModule(authModule);

fastifyEngine.registerReactApp('/app');
// await fastifyEngine.compileReactApp();

void fastifyEngine.start();
