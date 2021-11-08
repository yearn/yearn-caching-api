import fp from "fastify-plugin";

async function cachedCall(call, key, ttl) {
  const hit = await this.cache.has(key);

  let value;
  if (hit) {
    const cache = await this.cache.get(key);
    ttl = cache.ttl;
    value = cache.item;
  } else {
    value = await call();
    this.cache.set(key, value, ttl);
  }
  return [hit, value, parseInt(ttl / 1000)];
}

/**
 * This plugins adds some helpful utilities
 */
export default fp(async function (api) {
  api.decorate("helpers", { cachedCall: cachedCall.bind(api) });
});
