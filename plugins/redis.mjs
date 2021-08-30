import fp from "fastify-plugin";

import IORedis from "ioredis";

export const redis = new IORedis({ host: "redis" });
// export const redis = new IORedis({ host: "localhost", port: 6379 });

/**
 * This plugins adds a shared redis connection
 *
 * @see https://github.com/fastify/fastify-redis
 */
export default fp(async function (api) {
  api.register(await import("fastify-redis"), {
    client: redis,
  });

  api.register(await import("fastify-cors"), {
    origin: "*",
    methods: "GET",
  });
});
