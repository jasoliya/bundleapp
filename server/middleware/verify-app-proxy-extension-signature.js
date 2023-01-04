import crypto from "crypto";

function verifySignature(
    query = {},
    shopifyApiSecret
) {
    const { signature = "", ...otherQueryParams } = query;
    
    const input = Object.keys(otherQueryParams)
        .sort()
        .map((key) => {
            const value = otherQueryParams[key];
            return `${key}=${value}`
        })
        .join("");
    
    const sha = crypto.createHmac('sha256', shopifyApiSecret);
    let sha_result = sha.update(input);
    sha_result = sha_result.digest('hex');

    const digest = Buffer.from(sha_result, "utf-8");
    const checksum = Buffer.from(signature, "utf-8");
    
    return(
        digest.length === checksum.length &&
        crypto.timingSafeEqual(digest, checksum)
    );
}

export default function verifyAppProxyExtensionSignature(req, res, next) {
    if(
        verifySignature(
            req.query,
            process.env.SHOPIFY_API_SECRET
        )
    ) {
        return next();
    }
    res.status(401).send({error: 'Signature verification failed'});
}
