import { cache } from "../plugins/caching.mjs";
import { sdks } from "../plugins/sdk.mjs";
import { StrategiesMetadataGetCacheTime } from "../routes/v1/chains/:chainId/strategies/metadata/index.mjs";
import { makeStrategiesMetadataGetCacheKey } from "../routes/v1/chains/:chainId/strategies/metadata/index.mjs";

(async () => {
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const strategies = await sdk.strategies.vaultsStrategiesMetadata();
    if (strategies.length) {
      cache.set(
        makeStrategiesMetadataGetCacheKey(chainId),
        strategies,
        StrategiesMetadataGetCacheTime
      );
    }
  }
  process.exit(0);
})();
