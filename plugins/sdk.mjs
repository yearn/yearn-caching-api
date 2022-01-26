import fp from "fastify-plugin";

import { Yearn, AssetService } from "@yfi/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { cache } from "./caching.mjs";
import ms from "ms";

const chains = [1, 250];

const providerForChain = (chain) => {
  switch (chain) {
    case 1:
      return new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER);
    case 250:
      return new JsonRpcProvider("https://rpc.ftm.tools/");
  }
};

export const makeSdksWithCachedState = async () => {
  let sdks = {};
  for (const chain of chains) {
    const stateKey = `assetServiceState.${chain}`;
    const cachedState = await cache.get(stateKey);
    if (cachedState) {
      let state = AssetService.deserializeState(cachedState.item);
      const provider = providerForChain(chain);
      await provider.ready;
      const sdk = new Yearn(chain, { provider, cache: { useCache: false } }, state);
      sdks[chain] = sdk;
    } else {
      const provider = providerForChain(chain);
      await provider.ready;
      const sdk = new Yearn(chain, { provider, cache: { useCache: false } });
      sdks[chain] = sdk;
    }
  }
  return sdks;
};

const makeSdks = () => {
  let sdks = {};
  for (const chain of chains) {
    const provider = providerForChain(chain);
    const sdk = new Yearn(chain, { provider, cache: { useCache: false } });
    sdks[chain] = sdk;
  }
  return sdks;
};

const populateSdkAssetCache = async (sdk, chain) => {
  const state = await sdk.services.asset.makeSerializedState();
  const key = `assetServiceState.${chain}`;
  cache.set(key, state, ms("99 years"));
};

/**
 * This plugins adds an SDK instance to the fastify object
 *
 * @see https://github.com/yearn/yearn-sdk
 */
export default fp(async function (api) {
  const sdks = makeSdks();

  const getSdk = (chainId) => {
    return sdks[chainId];
  };

  api.decorate("getSdk", getSdk);

  const assetCachePromises = [];

  for (const [chain, sdk] of Object.entries(sdks)) {
    const promise = populateSdkAssetCache(sdk, chain);
    assetCachePromises.push(promise);
  }

  await Promise.all(assetCachePromises);
});
