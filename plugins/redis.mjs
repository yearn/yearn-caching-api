import fp from "fastify-plugin";

import IORedis from "ioredis";

export const redis = new IORedis({ host: "redis" });

/**
 * This plugins adds a shared redis connection
 *
 * @see https://github.com/fastify/fastify-redis
 */
export default fp(async function (api) {
  api.register(import("fastify-redis"), {
    client: redis,
  });
});
