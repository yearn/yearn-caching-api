import ms from "ms";

const TokensSupportedCacheKey = "tokens.supported";
const TokensSupportedCacheTime = ms("10 minutes");

export const TokensMetadataCacheKey = "tokens.metadata";
export const TokensMetadataCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/supported", async (_, reply) => {
    let [hit, supported] = await api.helpers.cachedCall(
      () => api.sdk.tokens.supported(),
      TokensSupportedCacheKey,
      TokensSupportedCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(supported);
  });

  api.get("/metadata", async (request, reply) => {
    let [hit, metadata] = await api.helpers.cachedCall(
      () => api.sdk.tokens.metadata(),
      TokensMetadataCacheKey,
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
