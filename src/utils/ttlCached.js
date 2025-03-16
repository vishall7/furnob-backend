import TTLCache from "@isaacs/ttlcache";

export const userCache = new TTLCache({
    max: 500,
    ttl: 1000 * 60 * 60, // 1 hour
});