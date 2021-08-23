import { yearn } from "../plugins/sdk.mjs";
import { cache } from "../plugins/caching.mjs";
import { VaultsAllCacheKey, VaultsAllCacheTime } from "../routes/v1/chains/1/vaults/index.mjs";

(async () => {
  const vaults = await yearn.vaults.get();
  cache.set(VaultsAllCacheKey, vaults, VaultsAllCacheTime);
  process.exit(0);
})();
