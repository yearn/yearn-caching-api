import { cache } from "../plugins/caching.mjs";
import { makeSdksWithCachedState } from "../plugins/sdk.mjs";
import { VaultsEarningsCacheTime } from "../routes/v1/chains/:chainId/vaults/earnings/index.mjs";
import { makeVaultsEarningsCacheKey } from "../routes/v1/chains/:chainId/vaults/earnings/index.mjs";

(async () => {
  const sdks = await makeSdksWithCachedState();
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const earnings = await sdk.earnings.assetsHistoricEarnings();
    if (earnings.length) {
      cache.set(makeVaultsEarningsCacheKey(chainId), earnings, VaultsEarningsCacheTime);
    }
  }
  process.exit(0);
})();
