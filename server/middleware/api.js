import { Shopify } from '@shopify/shopify-api';
import verifyAppProxyExtensionSignature from './verify-app-proxy-extension-signature.js';
import { getBundleProducts, getBundle, getSession, setBundle, getBundles, removeBundle, getUploadedImage, uploadImage, removeImage } from '../helpers/utilities.js';
import { APP_INSTALLATION, STAGED_UPLOAD, SET_METAFIELD, APP_META, SHOP_QUERY } from '../helpers/api-query.js';

export default function apiEndPoints(app) {
    app.get('/api/dashboard', async (req, res) => {
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
                        shop: {
                            name
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: SHOP_QUERY
                }
            })

            res.status(200).send({shop_name: name});
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    });

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
                    item_counts: tmpBundle.products.split('||').length,
                    tiers: tmpBundle.discount_tiers.length
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
            result['discount_type'] = bundle.discount_type;
            result['discount_trigger'] = bundle.discount_trigger;
            result['minimum_threshold'] = bundle.minimum_threshold;
            result['discount_tiers'] = bundle.discount_tiers;
            result['show_variants'] = bundle.show_variants;
            result['discount_name'] = bundle.discount_name;
            result['extra_class'] = bundle.extra_class;
            result['products'] = metaProducts.edges.map((product) => {
                return {
                    handle: product.node['handle'],
                    id: product.node['id'],
                    image: product.node['images'].edges[0].node['url'],
                    title: product.node['title']
                }
            });
            if(bundle.description) result['description'] = bundle.description;
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
                    item_counts: tmpBundle.products.split('||').length,
                    tiers: tmpBundle.discount_tiers.length
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
                discount_type: data.discount_type,
                discount_trigger: data.discount_trigger,
                minimum_threshold: data.minimum_threshold,
                discount_tiers: data.discount_tiers,
                show_variants: data.show_variants,
                discount_name: data.discount_name,
                extra_class: data.extra_class        
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
            result['discount_type'] = data.discount_type;
            result['discount_trigger'] = data.discount_trigger;
            result['minimum_threshold'] = data.minimum_threshold;
            result['discount_tiers'] = data.discount_tiers;
            result['show_variants'] = data.show_variants;
            result['discount_name'] = data.discount_name;
            result['extra_class'] = data.extra_class;
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
                discount_type: data.discount_type,
                discount_trigger: data.discount_trigger,
                minimum_threshold: data.minimum_threshold,
                discount_tiers: data.discount_tiers,
                show_variants: data.show_variants,
                discount_name: data.discount_name,
                extra_class: data.extra_class
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

            const metafields = await getBundles(client);
            const handles = metafields.edges.filter(({ node }) => {
                return node.key.indexOf('bundle_') >= 0
            }).map(({ node }) => {
                return node.key.replace('bundle_','');
            });
        
            var counter = data.id.match(/-?[0-9]$/gi);
            counter = counter === null ? 0 : parseInt(counter[0].replace('-',''));
            let handle = data.id;
            while(handles.indexOf(handle) >= 0) {
                counter++;
                handle = data.id.replace(/-?[0-9]$/gi, '')+'-'+counter;
            }

            await setBundle(client, handle, bundle);
            res.status(200).send({handle: handle});
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

            await client.query({
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

            res.status(200).send(data);
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
            const data = req.body;
            
            checkout.line_items = data.line_items;
            if(data.applied_discount) checkout.applied_discount = data.applied_discount;
            
            await checkout.save({
                update: true
            });

            return res.status(200).send({...checkout});
        } catch (error) {
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