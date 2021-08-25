import ms from "ms";
import fetch from "cross-fetch";

export const getVaultCacheKey = (address) => `vaults.${address.toLowerCase()}`;

const VaultsTokensCacheKey = "vaults.tokens";
const VaultsTokensCacheTime = ms("10 minutes");

export const VaultsAllCacheKey = "vaults.all";
export const VaultsAllCacheTime = ms("1 day");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/get", async (request, reply) => {
    let vaultKeys = [];
    if (request.query.addresses) {
      vaultKeys = request.query.addresses
        .toLowerCase()
        .split(",")
        .map((address) => getVaultCacheKey(address));
    } else {
      vaultKeys = await api.cache.keys("vaults.0x*");
    }

    const vaults = await Promise.all(
      vaultKeys.map(async (key) => {
        return await api.cache.get(key).then((cache) => cache.item);
      })
    ).then((vaults) => {
      if (request.query.tokens) {
        const addresses = request.query.tokens.toLowerCase().split(",");
        return vaults.filter((vault) => addresses.includes(vault.token.toLowerCase()));
      }
      return vaults;
    });

    reply.header("X-Cache-Hit", vaults.length !== 0).send(vaults);
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
