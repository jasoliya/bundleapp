import shopify from "../shopify.js";
import { SHOP_QUERY, STAGED_UPLOAD, APP_META, APP_INSTALLATION, SET_METAFIELD } from "../helpers/api-query.js";
import { getBundle, getBundleProducts, getBundles, getUploadedImage, removeBundle, removeImage, setBundle, uploadImage } from "../helpers/utilities.js";
import verifyAppProxyExtensionSignature from "./verify-app-proxy-extension-signature.js";

export default function bundleApiEndpoints(app) {
    app.get('/api/dashboard', async (req, res) => {
        let status = 200, error = null, data = null;
        
        const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });

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
            });
            data = { shop_name: name }
        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.get('/api/bundles', async (req, res) => {
        let status = 200, error = null, data = null;

        try {
            const bundlesMeta = await getBundles(res.locals.shopify.session);
            let tmpBundle;
            data = bundlesMeta.edges.filter(({ node }) => {
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
        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.get('/api/bundles/:id', async (req, res) => {
        let status = 200, error = null, data = null;
        
        const id = req.params.id;
        
        try {
            const bundleMeta = await getBundle(res.locals.shopify.session, id);
            if(!bundleMeta) throw new Error("Couldn't find bundle");
                        
            const bundle = JSON.parse(bundleMeta.value);
            const metaProducts = await getBundleProducts(res.locals.shopify.session, bundle);

            data = {};
            data['id'] = id;
            data['title'] = bundle.title;
            data['discount_type'] = bundle.discount_type;
            data['discount_trigger'] = bundle.discount_trigger;
            data['minimum_threshold'] = bundle.minimum_threshold;
            data['discount_tiers'] = bundle.discount_tiers;
            data['show_variants'] = bundle.show_variants;
            data['discount_name'] = bundle.discount_name;
            data['extra_class'] = bundle.extra_class;
            data['products'] = metaProducts.edges.map(({ node }) => {
                return {
                    handle: node['handle'],
                    id: node['id'],
                    image: node['images'].edges[0]?.node['url'],
                    title: node['title']
                }
            });
            
            if(bundle.description) data['description'] = bundle.description;
            if(bundle.image) data['image'] = bundle.image;

        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.post('/api/bundles', async (req, res) => {
        let status = 200, error = null, data = null;

        const session = res.locals.shopify.session;
        let formData = req.body;

        try {
            let bundle = {
                title: formData.title,
                products: formData.productsInput,
                discount_type: formData.discount_type,
                discount_trigger: formData.discount_trigger,
                minimum_threshold: formData.minimum_threshold,
                discount_tiers: formData.discount_tiers,
                show_variants: formData.show_variants,
                discount_name: formData.discount_name,
                extra_class: formData.extra_class
            }

            if(formData.description) {
                if(formData.description !== '<p></p>') bundle.description = formData.description;
            }

            if(formData.tmp_image) {
                const mediaId = await uploadImage(session, `Image for ${bundle.title}`, formData.tmp_image);
                const image = await getUploadedImage(session, mediaId);

                bundle.image = {
                    id: mediaId,
                    url: image.url,
                    alt: image.altText
                }
            }

            const metafields = await getBundles(session);
            const handles = metafields.edges.filter(({ node }) => {
                return node.key.indexOf('bundle_') >= 0
            }).map(({ node }) => {
                return node.key.replace('bundle_','');
            });
        
            var formHandle = formData.id === 'new' ? 'new-1' : formData.id;
            var counter = formHandle.match(/-?[0-9]$/gi);
            counter = counter === null ? 0 : parseInt(counter[0].replace('-',''));
            let handle = formHandle;

            while(handles.indexOf(handle) >= 0) {
                counter++;
                handle = formHandle.replace(/-?[0-9]$/gi, '')+'-'+counter;
            }
            
            await setBundle(session, handle, bundle);
            data = { handle };
        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.patch('/api/bundles/:id', async (req, res) => {
        let status = 200, error = null, data = null;

        const session = res.locals.shopify.session;
        let formData = req.body;

        const id = req.params.id;

        try {
            const bundle = {
                title: formData.title,
                products: formData.productsInput,
                discount_type: formData.discount_type,
                discount_trigger: formData.discount_trigger,
                minimum_threshold: formData.minimum_threshold,
                discount_tiers: formData.discount_tiers,
                show_variants: formData.show_variants,
                discount_name: formData.discount_name,
                extra_class: formData.extra_class        
            }

            let keepCurrentImage = true;

            if(formData.removed_image) {
                keepCurrentImage = false;
                removeImage(session, formData.removed_image);
            }

            if(formData.tmp_image) {
                keepCurrentImage = false;
                const mediaId = await uploadImage(session, `Image for ${bundle.title}`, formData.tmp_image);
                const image = await getUploadedImage(session, mediaId);

                bundle.image = {
                    id: mediaId,
                    url: image.url,
                    alt: image.altText
                }
            }

            if(keepCurrentImage) {
                if(formData?.image) bundle.image = formData.image;
            }
            
            if(formData.description) {
                if(formData.description !== '<p></p>') bundle.description = formData.description;
            }

            await setBundle(session, id, bundle, 'edit');

            const metaProducts = await getBundleProducts(session, bundle);

            data = {};
            data['id'] = id;
            data['title'] = formData.title;
            data['discount_type'] = formData.discount_type;
            data['discount_trigger'] = formData.discount_trigger;
            data['minimum_threshold'] = formData.minimum_threshold;
            data['discount_tiers'] = formData.discount_tiers;
            data['show_variants'] = formData.show_variants;
            data['discount_name'] = formData.discount_name;
            data['extra_class'] = formData.extra_class;
            data['products'] = metaProducts.edges.map(({node}) => {
                return {
                    handle: node['handle'],
                    id: node['id'],
                    image: node['images'].edges[0]?.node['url'],
                    title: node['title']
                }
            });
            
            if(bundle.image) data['image'] = bundle.image;
            if(bundle.description) data['description'] = bundle.description;

        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.delete('/api/bundles/:id', async (req, res) => {
        let status = 200, error = null, data = null;

        const session = res.locals.shopify.session;
        
        try {
            const deletedId  = await removeBundle(session, req.params.id);
            if(!deletedId) throw new Error("Couldn't find bundle");
            
            const bundlesMeta = await getBundles(session);
            let tmpBundle;
            data = bundlesMeta.edges.filter(({ node }) => {
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
        } catch(e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.post('/api/stageBundleImg', async (req, res) => {
        let status = 200, error = null, data = null;
        
        const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });

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

            data = stagedTargets[0];
        } catch(e) {
            status = 500;
            error = e.message;
        }       
        
        res.status(status).send({ success: status === 200, data, error });
    });

    app.get('/api/settings', async (req, res) => {
        let status = 200, error = null, data = null;

        const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });

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

            data = metafield?.value ? JSON.parse(metafield.value) : {};
        } catch (e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    });

    app.post('/api/settings', async (req, res) => {
        let status = 200, error = null, data = null;

        const client = new shopify.api.clients.Graphql({ session: res.locals.shopify.session });
        
        const formData = req.body;

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
                                value: JSON.stringify(formData)
                            }
                        ]
                    }
                }
            });

            data = formData;
        } catch (e) {
            status = 500;
            error = e.message;
        }

        res.status(status).send({ success: status === 200, data, error });
    })

    app.post('/orderCreate', verifyAppProxyExtensionSignature, async (req, res) => {
        let status = 200, error = null, data = null;

        try {
            const { shop } = req.query;
            if(!shop) throw new Error('Unauthorized request');
            if(!req.body) throw new Error('Required data missing');
            
            const sessionId = shopify.api.session.getOfflineId(shop);
            const session = await shopify.config.sessionStorage.loadSession(sessionId);

            const checkout = new shopify.api.rest.Checkout({ session });
            
            const reqData = req.body;
            
            checkout.line_items = reqData.line_items;
            if(reqData.applied_discount) checkout.applied_discount = reqData.applied_discount;
            
            await checkout.save({
                update: true
            });

            data = checkout;
        } catch (e) {
            status = 500;
            error = e.message;
        }
        console.log(error);
        res.status(status).send({ success: status === 200, data, error });
    });
}