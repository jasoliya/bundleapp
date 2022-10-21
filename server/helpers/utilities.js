import { Shopify } from "@shopify/shopify-api";

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
        res.status(401).send("Couldn't find a Shopify session");
    } else {
        return session;
    }

    return undefined;
}