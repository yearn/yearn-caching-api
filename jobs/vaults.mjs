import { cache } from "../plugins/caching.mjs";
import { sdks } from "../plugins/sdk.mjs";
import { VaultsGetCacheTime } from "../routes/v1/chains/:chainId/vaults/index.mjs";
import { makeVaultsGetCacheKey } from "../routes/v1/chains/:chainId/vaults/index.mjs";

(async () => {
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const vaults = await sdk.vaults.get();
    if (vaults.length) {
      cache.set(makeVaultsGetCacheKey(chainId), vaults, VaultsGetCacheTime);
    }
  }
  process.exit(0);
})();
