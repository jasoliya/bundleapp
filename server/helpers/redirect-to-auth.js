import crypto from 'crypto';
import { Shopify } from '@shopify/shopify-api';
import { serialize } from './utilities.js';

export default async function redirectToAuth(req, res) {
    let query_obj = {...req.query};
    if(!query_obj.hmac) return res.status(401).send('Installation parameter missing');
    
    delete query_obj.hmac;
    let access_str = serialize(query_obj);
    let sha = crypto.createHmac('sha256',process.env.SHOPIFY_API_SECRET);
    let sha_result = sha.update(access_str);
    sha_result = sha_result.digest('hex');

    if(sha_result !== req.query.hmac) return res.status(401).send('Verification failed');
    
    const redirectUrl = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        '/api/auth/callback',
        false
    );

    return res.redirect(redirectUrl);
}