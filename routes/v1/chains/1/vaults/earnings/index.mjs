import ms from "ms";

export const VaultsEarningsCacheKey = "vaults.earnings.get";
export const VaultsEarningsCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/get", async (request, reply) => {
    let [hit, vaultsEarnings] = await api.helpers.cachedCall(
      () => api.sdk.earnings.assetsHistoricEarnings(),
      VaultsEarningsCacheKey,
      VaultsEarningsCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      vaultsEarnings = vaultsEarnings.filter((vaultEarnings) => {
        return addresses.includes(vaultEarnings.assetAddress.toLowerCase());
      });
    }

    reply.header("X-Cache-Hit", hit).send(vaultsEarnings);
  });
}
