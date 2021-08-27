import ms from "ms";

export const StrategiesMetadataGetCacheKey = "strategies.metadata.get";
export const StrategiesMetadataGetCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/get", async (request, reply) => {
    let [hit, strategies] = await api.helpers.cachedCall(
      () => api.sdk.strategies.vaultsStrategiesMetadata(),
      StrategiesMetadataGetCacheKey,
      StrategiesMetadataGetCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      strategies = strategies.filter((strategy) => {
        return addresses.includes(strategy.address.toLowerCase());
      });
    }

    reply.header("X-Cache-Hit", hit).send(strategies);
  });
}
