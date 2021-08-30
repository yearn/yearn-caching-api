import { cache } from "../plugins/caching.mjs";
import { yearn } from "../plugins/sdk.mjs";
import { VaultsEarningsCacheTime } from "../routes/v1/chains/1/vaults/earnings/index.mjs";
import { VaultsEarningsCacheKey } from "../routes/v1/chains/1/vaults/earnings/index.mjs";

(async () => {
  const earnings = await yearn.earnings.assetsHistoricEarnings();
  if (earnings.length) {
    cache.set(VaultsEarningsCacheKey, earnings, VaultsEarningsCacheTime);
  }
  process.exit(0);
})();
