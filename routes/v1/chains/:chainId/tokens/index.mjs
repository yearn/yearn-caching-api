import ms from "ms";

export const makeTokensSupportedCacheKey = (chainId) => `tokens.supported.${chainId}`;
export const TokensSupportedCacheTime = ms("10 minutes");

export const makeTokensMetadataCacheKey = (chainId) => `tokens.metadata.${chainId}`;
export const TokensMetadataCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  const schema = api.getSchema("chainIdParam");

  api.get("/supported", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, supported] = await api.helpers.cachedCall(
      () => sdk.tokens.supported(),
      makeTokensSupportedCacheKey(chainId),
      TokensSupportedCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(supported);
  });

  api.get("/metadata", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, metadata] = await api.helpers.cachedCall(
      () => sdk.tokens.metadata(),
      makeTokensMetadataCacheKey(chainId),
      TokensMetadataCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      metadata = metadata.filter((metadata) => {
        return addresses.includes(metadata.address.toLowerCase());
      });
    }

    reply.header("X-Cache-Hit", hit).send(metadata);
  });
}
