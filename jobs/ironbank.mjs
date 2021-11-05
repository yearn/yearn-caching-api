import { cache } from "../plugins/caching.mjs";
import { sdks } from "../plugins/sdk.mjs";
import {
  IronBankGetCacheTime,
  IronBankGetDynamicCacheTime,
  IronBankTokensCacheTime,
} from "../routes/v1/chains/:chainId/ironbank/index.mjs";
import {
  makeIronBankGetCacheKey,
  makeIronBankGetDynamicCacheKey,
  makeIronBankTokensCacheKey,
} from "../routes/v1/chains/:chainId/ironbank/index.mjs";

(async () => {
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const assets = await sdk.ironBank.get();
    if (assets.length) {
      cache.set(makeIronBankGetCacheKey(chainId), assets, IronBankGetCacheTime);
    }

    const dynamic = await sdk.ironBank.getDynamic();
    if (dynamic.length) {
      cache.set(makeIronBankGetDynamicCacheKey(chainId), dynamic, IronBankGetDynamicCacheTime);
    }

    const tokens = await sdk.ironBank.tokens();
    if (tokens.length) {
      cache.set(makeIronBankTokensCacheKey(chainId), tokens, IronBankTokensCacheTime);
    }
  }
  process.exit(0);
})();
