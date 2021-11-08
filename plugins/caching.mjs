import fp from "fastify-plugin";

import cacheConfig from "abstract-cache";

import { redis } from "./redis.mjs";

export const cache = cacheConfig({
  useAwait: true,
  driver: {
    name: "abstract-cache-redis", // must be installed via `npm install`
    options: { client: redis },
  },
});

/**
 * This plugins adds cache control
 *
 * @see https://github.com/fastify/fastify-caching
 */
export default fp(async function (api) {
  api.register(await import("fastify-caching"), {
    cache: cache,
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#cacheability
    privacy: "public",
  });
});
