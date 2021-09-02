import { cache } from "../plugins/caching.mjs";
import { yearn } from "../plugins/sdk.mjs";
import { TokensMetadataCacheTime } from "../routes/v1/chains/1/tokens/index.mjs";
import { TokensMetadataCacheKey } from "../routes/v1/chains/1/tokens/index.mjs";

(async () => {
  const metadata = await yearn.tokens.metadata();
  if (metadata.length) {
    cache.set(TokensMetadataCacheKey, metadata, TokensMetadataCacheTime);
  }
  process.exit(0);
})();
