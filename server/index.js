import { join } from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

Shopify.Webhooks.Registry.addHandler('APP_UNINSTALLED', {
    path: '/webhooks',
    webhookHandler: async (_topic, shop, _body) => {
        console.log('App uninstalled');
        await AppInstallation.delete(shop);
    }
})

export async function createAppServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production"
) {
    const app = express();
    
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

    applyAuthMiddleware(app);

    app.post('/webhooks', async (req, res) => {
        try {
            await Shopify.Webhooks.Registry.process(req, res);
        } catch (e) {
            console.log(`Failed to process webhook ${e.message}`);
        }
    });

    app.get('/api', async (req, res) => {
        res.status(200).send({success: true});
    });

    app.use((req, res, next) => {
        const shop = req.query.shop;
        if(shop) {
            res.setHeader(
                'Content-Security-Policy',
                `frame-ancestors https://${shop} https://admin.shopify.com`
            );
        }
        next();
    });

    app.use('/*', async (req, res, next) => {
        const { shop } = req.query;
        
        if(shop) {
            const appInstalled = await AppInstallation.includes(shop);
                        
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