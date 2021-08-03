import fp from "fastify-plugin";

async function cachedCall(call, key, ttl) {
  const hit = await this.cache.has(key);

  let value;
  if (hit) {
    const cache = await this.cache.get(key);
    value = cache.item;
  } else {
    value = await call();
    this.cache.set(key, value, ttl);
  }
  return [hit, value];
}

/**
 * This plugins adds some helpful utilities
 */
export default fp(async function (api) {
  api.decorate("helpers", { cachedCall: cachedCall.bind(api) });
});
