import ms from "ms";

export const makeIronBankGetCacheKey = (chainId) => `ironbank.get.${chainId}`;
export const IronBankGetCacheTime = ms("10 minutes");

export const makeIronBankGetDynamicCacheKey = (chainId) => `ironbank.getDynamic.${chainId}`;
export const IronBankGetDynamicCacheTime = ms("10 minutes");

export const makeIronBankTokensCacheKey = (chainId) => `ironbank.tokens.${chainId}`;
export const IronBankTokensCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  const schema = api.getSchema("chainIdParam");

  api.get("/get", async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, vaults] = await api.helpers.cachedCall(
      () => sdk.ironBank.get(),
      makeIronBankGetCacheKey(chainId),
      IronBankGetCacheTime
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

  api.get("/getDynamic", async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, vaults] = await api.helpers.cachedCall(
      () => sdk.ironBank.getDynamic(),
      makeIronBankGetDynamicCacheKey(chainId),
      IronBankGetDynamicCacheTime
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

  api.get("/tokens", async (request, reply) => {
    const chainId = request.params.chainId;
    const sdk = api.getSdk(chainId);

    let [hit, tokens] = await api.helpers.cachedCall(
      () => sdk.ironBank.tokens(),
      makeIronBankTokensCacheKey(chainId),
      IronBankTokensCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(tokens);
  });
}
