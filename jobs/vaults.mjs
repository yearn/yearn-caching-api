import { cache } from "../plugins/caching.mjs";
import { yearn } from "../plugins/sdk.mjs";
import { VaultsGetCacheTime } from "../routes/v1/chains/1/vaults/index.mjs";
import { VaultsGetCacheKey } from "../routes/v1/chains/1/vaults/index.mjs";

(async () => {
  const vaults = await yearn.vaults.get();
  if (vaults.length) {
    cache.set(VaultsGetCacheKey, vaults, VaultsGetCacheTime);
  }
  process.exit(0);
})();
