import { cache } from "../plugins/caching.mjs";
import { sdks } from "../plugins/sdk.mjs";
import { TokensMetadataCacheTime } from "../routes/v1/chains/:chainId/tokens/index.mjs";
import { makeTokensMetadataCacheKey } from "../routes/v1/chains/:chainId/tokens/index.mjs";

(async () => {
  for (const [chainId, sdk] of Object.entries(sdks)) {
    const metadata = await sdk.tokens.metadata();
    if (metadata.length) {
      cache.set(makeTokensMetadataCacheKey(chainId), metadata, TokensMetadataCacheTime);
    }
  }
  process.exit(0);
})();
