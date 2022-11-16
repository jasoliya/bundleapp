export const SHOP_QUERY = `
    query {
        shop {
            name
        }
    }
`;

export const APP_INSTALLATION = `
    query getAppMeta {
        currentAppInstallation {
            id
        }
    }
`

export const SET_METAFIELD = `
    mutation createAppMeta($input: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $input) {
            metafields {
                id
                namespace
                key
                value
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const APP_META = `
    query getAppMeta($key: String!, $namespace: String!) {
        currentAppInstallation {
            metafield(key: $key, namespace: $namespace) {
                id
                value
            }
        }
    }
`

export const APP_META_GROUP = `
    query getAppMetaGroup($namespace:String){
        currentAppInstallation {
            metafields(first:100,namespace:$namespace) {
                edges {
                    node {
                        id
                        key
                        value
                    }
                }
            }
        }
    }
`;

export const GET_PRODUCTS = `
    query getMetaProduct($first: Int, $query: String) {
        products(first: $first, query: $query) {
            edges {
                node {
                    id
                    handle
                    title
                    images(first:1) {
                    	edges {
                            node {
                                url(transform:{
                                    maxWidth:100
                                    maxHeight:100
                                })
                            }
                        }	
                  	}
                }
            }
        }
    }
`

export const REMOVE_META = `
    mutation deleteMeta($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
            deletedId
        }
    }
`