import fp from "fastify-plugin";

/**
 * This plugins allows manipulation of cors headers
 *
 * @see https://github.com/fastify/fastify-metrics
 */
export default fp(async function (api) {
  api.register(await import("fastify-metrics"), {
    endpoint: "/metrics",
  });
});
