import fp from "fastify-plugin";

import cacheConfig from "abstract-cache";

import { redis } from "./redis.mjs";

const cache = cacheConfig({
  useAwait: false,
  driver: {
    name: "abstract-cache-redis", // must be installed via `npm install`
    options: { client: redis },
  },
});

/**
 * This plugins adds cache control.
 *
 * @see https://github.com/fastify/fastify-caching
 */
export default fp(async function (fastify) {
  fastify.register(import("fastify-caching"), { cache: cache });
});
