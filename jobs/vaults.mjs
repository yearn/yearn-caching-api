import { yearn } from "../plugins/sdk.mjs";
import { cache } from "../plugins/caching.mjs";
import { VaultsAllCacheKey, VaultsAllCacheTime } from "../routes/v1/chains/1/vaults/index.mjs";

(async () => {
  try {
    const vaults = await yearn.vaults.get();
    cache.set(VaultsAllCacheKey, vaults, VaultsAllCacheTime);
  } catch (error) {
    process.exit(1);
  }
  process.exit(0);
})();
