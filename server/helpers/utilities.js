import { Shopify } from "@shopify/shopify-api";
import { APP_INSTALLATION, APP_META, GET_PRODUCTS, SET_METAFIELD } from "./api-query.js";

export function serialize(obj) {
    let str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

export async function getSession(req, res) {
    const session = await Shopify.Utils.loadCurrentSession(req, res, false);
    if(!session) {
        res.status(401).send({error: "Couldn't find a Shopify session"});
    } else {
        return session;
    }

    return undefined;
}

export async function getBundles(client) {
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
                namespace: 'cdapp_bundle',
                key: 'bundles'
            }
        }
    });

    return JSON.parse(metaValue);
}

export async function setBundles(client, meta) {
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

    return JSON.parse(metafields[0].value);
}

export async function getBundleProducts(client, bundle) {
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
    });

    return metaProducts;
}