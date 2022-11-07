import { Shopify } from '@shopify/shopify-api';
import verifyAppProxyExtensionSignature from './verify-app-proxy-extension-signature.js';
import { GET_PRODUCTS } from '../helpers/api-query.js';
import { getBundleProducts, getBundles, getSession, setBundles } from '../helpers/utilities.js';

export default function apiEndPoints(app) {
    app.get('/api/bundles', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        )

        try {
            const appMeta = await getBundles(client);
            let bundles = [], bundle, current_bundle;
            for(var key in appMeta.bundles) {
                bundle = {};
                current_bundle = appMeta.bundles[key];
                bundle['id'] = key;
                bundle['title'] = current_bundle.title;
                bundle['item_counts'] = current_bundle.products.split('||').length;
                bundles.push(bundle);
            }

            res.status(200).send(bundles);
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

    app.get('/api/bundles/:id', async (req, res) => {
        const id = req.params.id;
        const session = await getSession(req, res);
        if(!session) return;
        
        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        )
        
        try {
            const appMeta = await getBundles(client);
            const bundle = appMeta['bundles'][id];
            if(!bundle) return res.status(401).send({error: "Couldn't find bundle"});

            const metaProducts = await getBundleProducts(client, bundle);
            
            let result = {};
            result['id'] = id;
            result['title'] = bundle.title
            result['products'] = metaProducts.edges.map((product) => {
                return {
                    handle: product.node['handle'],
                    id: product.node['id'],
                    image: product.node['images'].edges[0].node['url'],
                    title: product.node['title']
                }
            });
            
            res.status(200).send({...result});
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

    app.delete('/api/bundles/:id', async (req, res) => {
        const id = req.params.id;
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        );

        try {
            const appMeta = await getBundles(client);
            let bundles = appMeta['bundles'];
            if(typeof bundles[id] !== typeof undefined) delete bundles[id];
            
            await setBundles(client, appMeta);

            let result_bundles = [], bundle, current_bundle;
            for(var key in appMeta.bundles) {
                bundle = {};
                current_bundle = appMeta.bundles[key];
                bundle['id'] = key;
                bundle['title'] = current_bundle.title;
                bundle['item_counts'] = current_bundle.products.split('||').length;
                result_bundles.push(bundle);
            }

            res.status(200).send(result_bundles);
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

    app.patch('/api/bundles/:id', async (req, res) => {
        const id = req.params.id;
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        )

        const data = req.body;

        try {
            const appMeta = await getBundles(client);
            let bundles = appMeta['bundles'];
            if(!bundles[data.id]) bundles[data.id] = {};
            bundles[data.id]['title'] = data.title;
            bundles[data.id]['products'] = data.productsInput;

            await setBundles(client, appMeta);

            const metaProducts = await getBundleProducts(client, bundles[data.id]);

            let result = {};
            result['id'] = id;
            result['title'] = data.title;
            result['products'] = metaProducts.edges.map((product) => {
                return {
                    handle: product.node['handle'],
                    id: product.node['id'],
                    image: product.node['images'].edges[0].node['url'],
                    title: product.node['title']
                }
            });

            res.status(200).send({...result});
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

    app.post('/api/bundles', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        );

        const data = req.body;
        
        try {
            const appMeta = await getBundles(client);
            let bundles = appMeta['bundles'];
            bundles[data.id] = {};
            bundles[data.id]['title'] = data.title;
            bundles[data.id]['products'] = data.productsInput;

            const metafield = await setBundles(client, appMeta);
            res.status(200).send(metafield);
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

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