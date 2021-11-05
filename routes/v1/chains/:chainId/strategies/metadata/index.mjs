import ms from "ms";

export const makeStrategiesMetadataGetCacheKey = (chainId) => `strategies.metadata.get.${chainId}`;
export const StrategiesMetadataGetCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  const schema = api.getSchema("chainIdParam");

  api.get("/get", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, strategies] = await api.helpers.cachedCall(
      () => sdk.strategies.vaultsStrategiesMetadata(),
      makeStrategiesMetadataGetCacheKey(chainId),
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
