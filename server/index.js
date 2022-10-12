import { join } from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { Shopify, LATEST_API_VERSION } from '@shopify/shopify-api';
import applyAuthMiddleware from './middleware/auth.js';
import { AppInstallation } from './app_installations.js';
import redirectToAuth from './helpers/redirect-to-auth.js';

dotenv.config();

const { PORT = 5000, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST } = process.env;
const PROD_INDEX_PATH = `${process.cwd()}/dist`;
const DB_PATH = `/${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SCOPES.split(','),
    HOST_NAME: HOST.replace(/https?:\/\//,''),
    HOST_SCHEME: HOST.split('://')[0],
    API_VERSION: LATEST_API_VERSION,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH)
});

export async function createAppServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production"
) {
    const app = express();

    applyAuthMiddleware(app);

    app.get('/api', async (req, res) => {
        res.status(200).send({success: true});
    });

    app.use('/*', async (req, res, next) => {
        const { shop } = req.query;
        
        if(shop) {
            const appInstalled = await AppInstallation.includes(shop);
            console.log(`appInstalled: ${appInstalled}`);
            if(!appInstalled) {
                return redirectToAuth(req, res);
            } else {
                next();
            }
        } else {
            next();
        }
    });

    let vite;
    if(isProd) {
        const compression = await import('compression').then(
            ({default: fn}) => fn
        );
        const serverStatic = await import('serve-static').then(
            ({default: fn}) => fn
        );
        const fs = await import('fs');
        app.use(compression());
        app.use(serverStatic(PROD_INDEX_PATH));
        app.use('/*', (req, res, next) => {
            res
              .status(200)
              .set('Content-Type', 'text/html')
              .send(fs.readFileSync(join(PROD_INDEX_PATH, 'index.html')));
        });  
    } else {
        vite = await import('vite').then(({ createServer }) => 
            createServer({
                root,
                server: {
                    port: PORT,
                    hmr: {
                        protocol: "ws",
                        host: "localhost",
                        port: 64999,
                        clientPort: 64999,
                    },
                    middlewareMode: "true",
                },
            })
        );

        app.use(vite.middlewares);
    }
    return { app, vite };
}

createAppServer().then(({ app }) => app.listen(PORT, () => {
    console.log(`server listen on port ${PORT}`);
}));