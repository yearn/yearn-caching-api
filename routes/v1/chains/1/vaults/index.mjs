import ms from "ms";
import fetch from "cross-fetch";

const VaultsGetCacheKey = "vaults.get";
const VaultsGetCacheTime = ms("10 minutes");

const VaultsTokensCacheKey = "vaults.tokens";
const VaultsTokensCacheTime = ms("10 minutes");

const VaultsAllCacheKey = "vaults.all";
const VaultsAllCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/get", async (request, reply) => {
    let [hit, vaults] = await api.helpers.cachedCall(
      () => api.sdk.vaults.get(),
      VaultsGetCacheKey,
      VaultsGetCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      vaults = vaults.filter((vault) => {
        return addresses.includes(vault.address.toLowerCase());
      });
    }

    // filter by token address
    if (request.query.tokens) {
      const addresses = request.query.tokens.toLowerCase().split(",");
      vaults = vaults.filter((vault) => {
        return addresses.includes(vault.token.toLowerCase());
      });
    }

    reply.header("X-Cache-Hit", hit).send(vaults);
  });

  api.get("/tokens", async (_, reply) => {
    let [hit, tokens] = await api.helpers.cachedCall(
      () => api.sdk.vaults.tokens(),
      VaultsTokensCacheKey,
      VaultsTokensCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(tokens);
  });

  api.get("/all", async (_, reply) => {
    let [hit, allVaults] = await api.helpers.cachedCall(
      () =>
        fetch(`${process.env.API_MIGRATION_URL}/v1/chains/1/vaults/all`).then((res) => res.json()),
      VaultsAllCacheKey,
      VaultsAllCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(allVaults);
  });
}
