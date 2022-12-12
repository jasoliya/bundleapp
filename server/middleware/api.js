import { Shopify } from '@shopify/shopify-api';
import verifyAppProxyExtensionSignature from './verify-app-proxy-extension-signature.js';
import { getBundleProducts, getBundle, getSession, setBundle, getBundles, removeBundle, getUploadedImage, uploadImage, removeImage } from '../helpers/utilities.js';
import { APP_INSTALLATION, STAGED_UPLOAD, SET_METAFIELD, APP_META } from '../helpers/api-query.js';

export default function apiEndPoints(app) {
    app.get('/api/bundles', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        )

        try {
            const bundlesMeta = await getBundles(client);
            let tmpBundle;
            const bundles = bundlesMeta.edges.filter(({ node }) => {
                return node.key.indexOf('bundle_') >= 0;     
            }).map(({ node: bundle }) => {
                tmpBundle = JSON.parse(bundle.value);
                return {
                    id: bundle.key.replace('bundle_',''),
                    title: tmpBundle.title,
                    status: tmpBundle.status,
                    item_counts: tmpBundle.products.split('||').length
                }
            });
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
            const bundleMeta = await getBundle(client, id);
            if(!bundleMeta) return res.status(401).send({error: "Couldn't find bundle"});
            
            const bundle = JSON.parse(bundleMeta.value);
            const metaProducts = await getBundleProducts(client, bundle);

            let result = {};
            result['id'] = id;
            result['title'] = bundle.title;
            result['status'] = bundle.status;
            result['discount_type'] = bundle.discount_type;
            result['discount_trigger'] = bundle.discount_trigger;
            result['discount_tiers'] = bundle.discount_tiers;
            result['text_add_button'] = bundle.text_add_button;
            result['text_grid_add_button'] = bundle.text_grid_add_button;
            result['text_grid_added_button'] = bundle.text_grid_added_button;
            result['products'] = metaProducts.edges.map((product) => {
                return {
                    handle: product.node['handle'],
                    id: product.node['id'],
                    image: product.node['images'].edges[0].node['url'],
                    title: product.node['title']
                }
            });
            if(bundle.description) result['description'] = bundle.description
            if(bundle.image) result['image'] = bundle.image;
            
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
            const deletedId  = await removeBundle(client, id);
            if(!deletedId) return res.status(401).send({error: "Couldn't find bundle"});

            const bundlesMeta = await getBundles(client);
            let tmpBundle;
            const bundles = bundlesMeta.edges.filter(({ node }) => {
                return node.key.indexOf('bundle_') >= 0;     
            }).map(({ node: bundle }) => {
                tmpBundle = JSON.parse(bundle.value);
                return {
                    id: bundle.key.replace('bundle_',''),
                    title: tmpBundle.title,
                    status: tmpBundle.status,
                    item_counts: tmpBundle.products.split('||').length
                }
            });
            res.status(200).send(bundles);
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
            const bundle = {
                title: data.title,
                products: data.productsInput,
                status: data.status,
                discount_type: data.discount_type,
                discount_trigger: data.discount_trigger,
                discount_tiers: data.discount_tiers,
                text_add_button: data.text_add_button,
                text_grid_add_button: data.text_grid_add_button,
                text_grid_added_button: data.text_grid_added_button                
            }

            let keepCurrentImage = true;

            if(data.removed_image) {
                keepCurrentImage = false;
                removeImage(client, data.removed_image);
            }

            if(data.tmp_image) {
                keepCurrentImage = false;
                const mediaId = await uploadImage(client, `Image for ${bundle.title}`, data.tmp_image);
                const image = await getUploadedImage(client, mediaId);

                bundle.image = {
                    id: mediaId,
                    url: image.url,
                    alt: image.altText
                }
            }

            if(keepCurrentImage) {
                if(data?.image) bundle.image = data.image;
            }
            
            if(data.description) {
                if(data.description !== '<p></p>') bundle.description = data.description;
            }

            await setBundle(client, id, bundle);

            const metaProducts = await getBundleProducts(client, bundle);

            let result = {};
            result['id'] = id;
            result['title'] = data.title;
            result['status'] = data.status;
            result['discount_type'] = data.discount_type;
            result['discount_trigger'] = data.discount_trigger;
            result['discount_tiers'] = data.discount_tiers;
            result['text_add_button'] = bundle.text_add_button;
            result['text_grid_add_button'] = bundle.text_grid_add_button;
            result['text_grid_added_button'] = bundle.text_grid_added_button;
            result['products'] = metaProducts.edges.map((product) => {
                return {
                    handle: product.node['handle'],
                    id: product.node['id'],
                    image: product.node['images'].edges[0].node['url'],
                    title: product.node['title']
                }
            });
            if(bundle.image) result['image'] = bundle.image;
            if(bundle.description) result['description'] = bundle.description;

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
            let bundle = {
                title: data.title,
                products: data.productsInput,
                status: data.status,
                discount_type: data.discount_type,
                discount_trigger: data.discount_trigger,
                discount_tiers: data.discount_tiers,
                text_add_button: data.text_add_button,
                text_grid_add_button: data.text_grid_add_button,
                text_grid_added_button: data.text_grid_added_button
            }

            if(data.description) {
                if(data.description !== '<p></p>') bundle.description = data.description;
            }

            if(data.tmp_image) {
                const mediaId = await uploadImage(client, `Image for ${bundle.title}`, data.tmp_image);
                const image = await getUploadedImage(client, mediaId);

                bundle.image = {
                    id: mediaId,
                    url: image.url,
                    alt: image.altText
                }
            }

            const metafield = await setBundle(client, data.id, bundle);
            res.status(200).send(metafield);
        } catch(error) {
            res.status(500).send({error: error.message});
        }
    });

    app.get('/api/settings', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        );

        try {
            const {
                body: {
                    data: {
                        currentAppInstallation: {
                            metafield
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: APP_META,
                    variables: {
                        namespace: 'cdapp_bundles',
                        key: 'settings'
                    }
                }
            });

            const result = metafield?.value ? JSON.parse(metafield.value) : {};
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    })

    app.post('/api/settings', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;

        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        );

        const data = req.body;

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
                                namespace: "cdapp_bundles",
                                key: 'settings',
                                value: JSON.stringify(data)
                            }
                        ]
                    }
                }
            });

            res.status(200).send(appInstallationId);
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    })

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
            res.status(500).send({error: error.message});
        }        
    });

    app.post('/api/stageBundleImg', async (req, res) => {
        const session = await getSession(req, res);
        if(!session) return;
        
        const client = new Shopify.Clients.Graphql(
            session.shop,
            session.accessToken
        );

        try {
            const {
                body: {
                    data: {
                        stagedUploadsCreate: {
                            stagedTargets
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: STAGED_UPLOAD,
                    variables: req.body
                }
            });

            res.status(200).send(stagedTargets[0]);
        } catch(error) {
            res.status(500).send({error: error.message});
        }        
    });
}