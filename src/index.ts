import 'reflect-metadata';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FastifyEngine } from '@core';
import { testModule } from '@modules/test';
import { authModule } from '@modules/auth';
import { pbModule } from '@modules/pb';
import { DataSource } from 'typeorm';
import * as entities from './model/entities'
import { AppDataSourceInit } from './model';
import { MediaItem } from './model/MediaItems';
import { Repositories } from './model';

const dbConnection = 'mariadb://lab:nsSFFt0UMF69]iF3@davidpascual.myasustor.com:3306/lab'

const { hostname, port, username, password, pathname } = new URL(dbConnection);

const database = pathname.slice(1);

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: decodeURIComponent(hostname),
    port: parseInt(port),
    username: decodeURIComponent(username),
    password: decodeURIComponent(password),
    database: decodeURIComponent(database),
    synchronize: false,
    logging: true,
    entities: entities,
});

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
await fastifyEngine.registerModule(pbModule);

fastifyEngine.registerReactApp('/app');
// await fastifyEngine.compileReactApp();
AppDataSource.initialize()
    .then(async () => {

        AppDataSourceInit(AppDataSource);
        void fastifyEngine.start();
    });
