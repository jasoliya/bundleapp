import { Shopify } from "@shopify/shopify-api";
import redirectToAuth from "../helpers/redirect-to-auth.js";

export default function verifyRequest(app) {
    return async (req, res, next) => {
        const session = await Shopify.Utils.loadCurrentSession(req, res, false);
        
        let shop = Shopify.Utils.sanitizeShop(req.query.shop);

        if(session && shop && session.shop !== shop) {
            return redirectToAuth(req, res);
        }

        next();
    }
}