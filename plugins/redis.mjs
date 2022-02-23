import fp from "fastify-plugin";

import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_CONNECTION_STRING || "redis://redis:6379");

/**
 * This plugins adds a shared redis connection
 *
 * @see https://github.com/fastify/fastify-redis
 */
export default fp(async function (api) {
  api.register(await import("fastify-redis"), {
    client: redis,
    closeClient: true
  });
});
