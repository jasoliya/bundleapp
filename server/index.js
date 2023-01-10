import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import dotenv from 'dotenv';
dotenv.config();

import shopify from './shopify.js';
import GDPRWebhookHandlers from './gdpr.js';
import bundleApiEndpoints from './middleware/bundle-api.js';
import verifyAppProxyExtensionSignature from './middleware/verify-app-proxy-extension-signature.js';

const PORT = parseInt(process.env.PORT || 5000);
const isDev = process.env.NODE_ENV === "development";
const STATIC_PATH = `${process.cwd()}/dist`;

const app = express();

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(),
    shopify.redirectToShopifyOrAppRoot()
);
app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

bundleApiEndpoints(app);

app.get('/bundle/:id', verifyAppProxyExtensionSignature, async (req, res) => {
    res
        .status(200)
        .set('Content-Type', 'application/liquid')
        .send(readFileSync(`${process.cwd()}/public/bundle.html`));
});

//app.use("/*", shopify.ensureInstalledOnShop());

if(isDev) {
    const root = process.cwd();
    let vite = await import('vite').then(({ createServer }) => 
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
                middlewareMode: true,
            },
        })
    );
    app.use(vite.middlewares);
} else {
    app.use(serveStatic(STATIC_PATH, { index: false }));

    app.use("/*", shopify.ensureInstalledOnShop(), async (req, res, next) => {
        res
            .status(200)
            .set("Content-Type", "text/html")
            .send(readFileSync(join(STATIC_PATH, 'index.html')));
    });
}

app.listen(PORT);