import { Shopify } from '@shopify/shopify-api';
import verifyAppProxyExtensionSignature from './verify-app-proxy-extension-signature.js';

export default function apiEndPoints(app) {
    app.post('/api/order', verifyAppProxyExtensionSignature, async (req, res) => {
        const { shop } = req.query;
        if(!shop) return res.status(401).send({error: 'Unauthorized request'});
        if(!req.body) return res.status(401).send({error: 'Required data missing'});
        const session = await Shopify.Utils.loadOfflineSession(shop);
        if(!session) return res.status(401).send({error: 'Could not find any session'});

        try {
            const { Checkout } = await import(`@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`);           
            const checkout = new Checkout({ session: session });
            let item = {}, req_data = req.body;
            let line_items = [];

            item['variant_id'] = req_data.variant_id;
            item['quantity'] = req_data.quantity;
            
            item['applied_discounts'] = [];
            item['applied_discounts'].push({
                amount: req_data.amount,
                description: "Bundle discount",
                application_type: "manual"
            });
            line_items.push(item);
            
            checkout.line_items = line_items;
            await checkout.save({
                update: true
            });

            res.status(200).send({...checkout});
        } catch(error) {
            console.log(error);
            res.status(500).send({error: error.message});
        }        
    });
}