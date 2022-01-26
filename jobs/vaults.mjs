import { cache } from "../plugins/caching.mjs";
import { makeSdksWithCachedState } from "../plugins/sdk.mjs";
import {
  VaultsGetCacheTime,
  VaultsGetDynamicCacheTime,
  VaultsTokensCacheTime,
} from "../routes/v1/chains/:chainId/vaults/index.mjs";
import {
  makeVaultsGetCacheKey,
  makeVaultsGetDynamicCacheKey,
  makeVaultsTokensCacheKey,
} from "../routes/v1/chains/:chainId/vaults/index.mjs";

(async () => {
  const sdks = await makeSdksWithCachedState();
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const vaults = await sdk.vaults.get();
    if (vaults.length) {
      cache.set(makeVaultsGetCacheKey(chainId), vaults, VaultsGetCacheTime);
    }

    const assetsStatic = await sdk.vaults.getStatic();
    const assetsAddresses = assetsStatic.map((asset) => asset.address);
    const size = 20;
    let vaultsDynamicResult = [];
    for (let i = 0; i < assetsAddresses.length; i += size) {
      let chunk = assetsAddresses.slice(i, i + size);
      const vaultsDynamic = await sdk.vaults.getDynamic(chunk);
      vaultsDynamicResult.push(vaultsDynamic);
    }
    if (vaultsDynamicResult.length) {
      cache.set(
        makeVaultsGetDynamicCacheKey(chainId),
        vaultsDynamicResult,
        VaultsGetDynamicCacheTime
      );
    }

    const tokens = await sdk.vaults.tokens();
    if (tokens.length) {
      cache.set(makeVaultsTokensCacheKey(chainId), tokens, VaultsTokensCacheTime);
    }
  }
  process.exit(0);
})();
