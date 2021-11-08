import ms from "ms";

export const makeVaultsEarningsCacheKey = (chainId) => `vaults.earnings.get.${chainId}`;
export const VaultsEarningsCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  const schema = api.getSchema("chainIdParam");

  api.get("/get", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, vaultsEarnings, ttl] = await api.helpers.cachedCall(
      () => sdk.earnings.assetsHistoricEarnings(),
      makeVaultsEarningsCacheKey(chainId),
      VaultsEarningsCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      vaultsEarnings = vaultsEarnings.filter((vaultEarnings) => {
        return addresses.includes(vaultEarnings.assetAddress.toLowerCase());
      });
    }

    reply
      .header("X-Cache-Hit", hit)
      .header("Cache-Control", `public, max-age=${ttl}`)
      .send(vaultsEarnings);
  });
}
