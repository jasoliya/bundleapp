import { BillingInterval, LATEST_API_VERSION } from '@shopify/shopify-api';
import { shopifyApp } from '@shopify/shopify-app-express';
import { SQLiteSessionStorage } from '@shopify/shopify-app-session-storage-sqlite';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-01';

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST } = process.env;
const DB_PATH = `${process.cwd()}/database.sqlite`;

const billingConfig = {
    "One-Time Charge": {
        amount: 5.0,
        currencyCode: "USD",
        interval: BillingInterval.OneTime
    },
};

const shopify = shopifyApp({
    api: {
        apiKey: SHOPIFY_API_KEY,
        apiSecretKey: SHOPIFY_API_SECRET,
        apiVersion: LATEST_API_VERSION,
        scopes: SCOPES.split(','),
        hostScheme: HOST.split('://')[0],
        hostName: HOST.replace(/https?:\/\//,''),
        billing: undefined,
        restResources
    },
    auth: {
        path: '/api/auth',
        callbackPath: '/api/auth/callback',
    },
    webhooks: {
        path: '/api/webhooks',
    },
    sessionStorage: new SQLiteSessionStorage(DB_PATH),
});

export default shopify;