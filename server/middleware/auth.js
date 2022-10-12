import { Shopify } from '@shopify/shopify-api';

export default function applyAuthMiddleware(app) {
    app.get('/auth/callback', async (req, res) => {
        try {
            const session = await Shopify.Auth.validateAuthCallback(
                req,
                res,
                req.query
            );
                
            const response = await Shopify.Webhooks.Registry.registerAll({
                shop: session.shop,
                accessToken: session.accessToken
            });
            console.log(Object.entries(response));
            Object.entries(response).map(([topic, response]) => {
                console.log(`Register ${topic} webhook: ${response.success}`);
            });

            const redirectUrl = Shopify.Utils.getEmbeddedAppUrl(req);
            res.redirect(redirectUrl);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
}