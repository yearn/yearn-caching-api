import fp from "fastify-plugin";

/**
 * This plugins allows us to expose the metrics endpoint fo
 * prometheus scraping.
 *
 * @see https://github.com/fastify/fastify-metrics
 */
export default fp(async function (api) {
  api.register(await import("fastify-metrics"), {
    endpoint: "/metrics",
  });
});
