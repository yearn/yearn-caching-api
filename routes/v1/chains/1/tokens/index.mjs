import ms from "ms";

const TokensSupportedCacheKey = "tokens.supported";
const TokensSupportedCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/supported", async (_, reply) => {
    let [hit, vaults] = await api.helpers.cachedCall(
      () => api.sdk.tokens.supported(),
      TokensSupportedCacheKey,
      TokensSupportedCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(vaults);
  });
}
