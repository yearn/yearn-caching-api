import fp from "fastify-plugin";

import { Yearn, AssetService } from "@yfi/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { cache } from "./caching.mjs";
import { CHAINS } from "../constants/chains.mjs";
import ms from "ms";

const makeAssetStateKey = (chain) => {
  return `assetServiceState.${chain}`;
};

const providerForChain = (chain) => {
  switch (chain) {
    case 1:
      return new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER);
    case 10:
      return new JsonRpcProvider("https://mainnet.optimism.io");
    case 250:
      return new JsonRpcProvider({
        url: "https://rpc.ankr.com/fantom",
        // url: process.env.WEB3_HTTP_PROVIDER_FTM_URL,
        // user: process.env.WEB3_HTTP_PROVIDER_FTM_USERNAME,
        // password: process.env.WEB3_HTTP_PROVIDER_FTM_PASSWORD,
      });
    case 42161:
      return new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_ARB);
  }
};

const getZapperApiKey = () => {
  return process.env.ZAPPER_API_KEY || "96e0cc51-a62e-42ca-acee-910ea7d2a241"; // Use zapper public API key by default;
};

const makeSdks = () => {
  let sdks = {};
  for (const chain of CHAINS) {
    const provider = providerForChain(chain);
    const sdk = new Yearn(chain, {
      provider,
      zapper: getZapperApiKey(),
      disableAllowlist: true,
      cache: { useCache: false },
      subgraph: {
        mainnetSubgraphEndpoint: process.env.MAINNET_SUBGRAPH_ENDPOINT,
      },
    });
    sdks[chain] = sdk;
  }
  return sdks;
};

const populateSdkAssetCache = async (sdk, chain) => {
  const state = await sdk.services.asset.makeSerializedState();
  const key = makeAssetStateKey(chain);
  // This duration shouldn't be too long, otherwise, for example, when icons for a new vault are
  // created and uploaded to Github, they won't be fetched until the api is restarted.
  cache.set(key, state, ms("4 hours"));
};

/**
 * Creates an SDK instance for each chain, with an attempt to use cached asset service state.
 * This is necessary because instantiating the SDK fetches asset information from Github.
 * Since each job instantiates a fresh instance of the SDK and these are run frequently, it
 * is possible to be rate limited by Github.
 * @returns A dictionary of chain ids to a corresponding instance of the SDK
 */
export const makeSdksWithCachedState = async () => {
  let sdks = {};
  for (const chain of CHAINS) {
    const stateKey = makeAssetStateKey(chain);
    const provider = providerForChain(chain);
    await provider.ready;

    const cachedState = await cache.get(stateKey);

    let sdk;
    // If the asset service state has been cached, then pass it through to the SDK to prevent
    // it being fetched from Github. Otherwise, instantiate the SDK without it, and populate the
    // asset service state cache.
    if (cachedState) {
      let state = AssetService.deserializeState(cachedState.item);
      sdk = new Yearn(
        chain,
        {
          provider,
          zapper: getZapperApiKey(),
          disableAllowlist: true,
          cache: { useCache: false },
          subgraph: {
            mainnetSubgraphEndpoint: process.env.MAINNET_SUBGRAPH_ENDPOINT,
          },
        },
        state
      );
    } else {
      sdk = new Yearn(chain, {
        provider,
        zapper: getZapperApiKey(),
        disableAllowlist: true,
        cache: { useCache: false },
        subgraph: {
          mainnetSubgraphEndpoint: process.env.MAINNET_SUBGRAPH_ENDPOINT,
        },
      });
      populateSdkAssetCache(sdk, chain);
    }
    sdks[chain] = sdk;
  }
  return sdks;
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

  // When the SDKs are first created, wait for them to provide the asset service state
  // and write it to the cache, so it can be used next time the SDK is instantiated,
  // for example, when the jobs are run.
  const assetCachePromises = [];

  for (const [chain, sdk] of Object.entries(sdks)) {
    const promise = populateSdkAssetCache(sdk, chain);
    assetCachePromises.push(promise);
  }

  await Promise.all(assetCachePromises);
});
