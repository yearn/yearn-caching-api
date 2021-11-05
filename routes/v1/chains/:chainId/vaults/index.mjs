import ms from "ms";
import fetch from "cross-fetch";

export const makeVaultsGetCacheKey = (chainId) => `vaults.get.${chainId}`;
export const VaultsGetCacheTime = ms("10 minutes");

export const makeVaultsGetDynamicCacheKey = (chainId) => `vaults.getDynamic.${chainId}`;
export const VaultsGetDynamicCacheTime = ms("10 minutes");

export const makeVaultsTokensCacheKey = (chainId) => `vaults.tokens.${chainId}`;
export const VaultsTokensCacheTime = ms("10 minutes");

const makeVaultsAllCacheKey = (chainId) => `vaults.all.${chainId}`;
const VaultsAllCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  const schema = api.getSchema("chainIdParam");

  api.get("/get", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, vaults] = await api.helpers.cachedCall(
      () => sdk.vaults.get(),
      makeVaultsGetCacheKey(chainId),
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

  api.get("/getDynamic", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, vaults] = await api.helpers.cachedCall(
      () => sdk.vaults.getDynamic(),
      makeVaultsGetDynamicCacheKey(chainId),
      VaultsGetDynamicCacheTime
    );

    // filter by address
    if (request.query.addresses) {
      const addresses = request.query.addresses.toLowerCase().split(",");
      vaults = vaults.filter((vault) => {
        return addresses.includes(vault.address.toLowerCase());
      });
    }

    reply.header("X-Cache-Hit", hit).send(vaults);
  });

  api.get("/tokens", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, tokens] = await api.helpers.cachedCall(
      () => sdk.vaults.tokens(),
      makeVaultsTokensCacheKey(chainId),
      VaultsTokensCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(tokens);
  });

  api.get("/all", { schema }, async (request, reply) => {
    const chainId = request.params.chainId;

    let [hit, allVaults] = await api.helpers.cachedCall(
      () =>
        fetch(`${process.env.API_MIGRATION_URL}/v1/chains/${chainId}/vaults/all`).then((res) =>
          res.json()
        ),
      makeVaultsAllCacheKey(chainId),
      VaultsAllCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(allVaults);
  });
}
