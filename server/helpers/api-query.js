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
                value
            }
        }
    }
`

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