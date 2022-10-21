import { Shopify } from '@shopify/shopify-api';
import verifyAppProxyExtensionSignature from './verify-app-proxy-extension-signature.js';
import { APP_INSTALLATION, APP_META, GET_PRODUCTS, SET_METAFIELD } from '../helpers/api-query.js';
import { getSession } from '../helpers/utilities.js';

export default function apiEndPoints(app) {
    app.get('/api/bundles/:id', async (req, res) => {
        const id = req.params.id;
        const session = await getSession(req, res);
        if(!session) return;
        
        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        )

        try {
            const {
                body: {
                    data: {
                        currentAppInstallation: {
                            metafield: {
                                value: metaValue
                            }
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: APP_META,
                    variables: {
                        namespace: "cdapp_bundle",
                        key: "bundles"
                    }
                }
            });
            
            const parsedMeta = JSON.parse(metaValue);
            const bundle = parsedMeta.bundles[id];
            if(bundle === undefined) return res.status(401).send({error: "Couldn't find bundle"});
            let query = bundle.products.split('||');
            query = query.map((item) => {
                const item_id = item.split('=')[0];
                return `id:${item_id}`
            });
            const query_str = query.join(' OR ');
            
            const {
                body: {
                    data: {
                        products: metaProducts
                    }
                }
            } = await client.query({
                data: {
                    query: GET_PRODUCTS,
                    variables: {
                        first: 10,
                        query: query_str
                    }
                }
            })

            res.status(200).send({success: metaProducts});
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
        let meta = {};
        meta['bundles'] = {};
        meta['bundles'][data.id] = {
            title: data.title,
            products: data.productsInput
        }

        try {
            const {
                body: {
                    data: {
                        currentAppInstallation: {
                            id: appInstallationId
                        }
                    }
                }            
            } = await client.query({
                data: {
                    query: APP_INSTALLATION
                }            
            });

            const {
                body: {
                    data: {
                        metafieldsSet: {
                            metafields
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: SET_METAFIELD,
                    variables: {
                        input: [
                            {
                                ownerId: appInstallationId,
                                type: "json",
                                namespace: "cdapp_bundle",
                                key: "bundles",
                                value: JSON.stringify(meta)
                            }
                        ]
                    }
                }
            });
            
            res.status(200).send(JSON.parse(metafields[0].value));
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