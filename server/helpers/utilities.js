import { Shopify } from "@shopify/shopify-api";
import { APP_INSTALLATION, APP_META, APP_META_GROUP, GET_IMAGE, GET_PRODUCTS, IMG_REMOVE, IMG_UPLOAD, REMOVE_META, SET_METAFIELD } from "./api-query.js";

export const poll = async ({ fn, validate, interval, maxAttempts, errorMsg }) => {
    let attempts = 0;

    const executePoll = async (resolve, reject) => {
        const result = await fn();
        attempts++;

        if (validate(result)) {
            return resolve(result);
        } else if (maxAttempts && attempts === maxAttempts) {
            return reject(new Error(errorMsg));
        } else {
            setTimeout(executePoll, interval, resolve, reject);
        }
    };

    return new Promise(executePoll);
};

export async function getUploadedImage(client, mediaId) {
    return await poll({
        fn: async () => {
            const {
                body: {
                    data: {
                        node: {
                            image
                        }
                    }
                }
            } = await client.query({
                data: {
                    query: GET_IMAGE,
                    variables: {
                        id: mediaId
                    }
                }
            });

            return image;
        },
        validate: (image) => {
            return image != null;
        },
        interval: 500,
        maxAttempts: 10,
        errorMsg: "Image could not be uploaded"
    });
}

export async function uploadImage(client, altText, resourseUrl) {
    const {
        body: {
            data: {
                fileCreate: {
                    files: [
                        {
                            id: mediaId
                        }
                    ]
                }
            }
        }
    } = await client.query({
        data: {
            query: IMG_UPLOAD,
            variables: {
                files: {
                    alt: altText,
                    contentType: 'IMAGE',
                    originalSource: resourseUrl
                }
            }
        }
    });

    return mediaId;
}

export async function removeImage(client, removeId) {
    const {
        body: {
            data: {
                fileDelete: {
                    deletedFileIds
                }
            }
        }
    } = await client.query({
        data: {
            query: IMG_REMOVE,
            variables: {
                fileIds: [removeId]
            }
        }
    });

    return deletedFileIds;
}

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
                    metafields
                }
            }
        }
    } = await client.query({
        data: {
            query: APP_META_GROUP,
            variables: {
                namespace: 'cdapp_bundles'
            }
        }
    });

    return metafields;
}

export async function getBundle(client, bundleId) {
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
                key: `bundle_${bundleId}`
            }
        }
    });

    return metafield;
}

export async function setBundle(client, bundleId, bundle) {
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
                        key: `bundle_${bundleId}`,
                        value: JSON.stringify(bundle)
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
                first: 24,
                query: query_str
            }
        }
    });

    return metaProducts;
}

export async function removeBundle(client, bundleId) {
    const bundleMeta = await getBundle(client, bundleId);

    if(!bundleMeta) return undefined;

    const bundle = JSON.parse(bundleMeta.value);
    if(bundle.image) removeImage(client, bundle.image.id);
    
    const {
        body: {
            data: {
                metafieldDelete: {
                    deletedId
                }
            }
        }
    } = await client.query({
        data: {
            query: REMOVE_META,
            variables: {
                input: {
                    id: bundleMeta.id
                }
            }
        }
    });

    return deletedId;
}