import ms from "ms";
import fetch from "cross-fetch";

import { yearn } from "../plugins/sdk.mjs";
import { cache } from "../plugins/caching.mjs";
import { getVaultCacheKey } from "../routes/v1/chains/1/vaults/index.mjs";
import { sendMessage } from "../telegram.mjs";
import { VaultsAllCacheKey } from "../routes/v1/chains/1/vaults/index.mjs";
import { VaultsAllCacheTime } from "../routes/v1/chains/1/vaults/index.mjs";

const setVaults = async () => {
  try {
    const vaults = await yearn.vaults.get();
    if (!vaults) {
      sendMessage(`setVaults - no vaults`);
    }
    for (const vault of vaults) {
      cache.set(getVaultCacheKey(vault.address), vault, ms("1 day"));
    }
  } catch (error) {
    sendMessage(`setVaults - ${error}`);
  }
};

const setTokens = async () => {
  try {
    const tokens = await yearn.vaults.tokens();
    if (tokens) {
      cache.set("vaults.tokens", tokens, ms("1 day"));
    } else {
      sendMessage(`setTokens - no tokens`);
    }
  } catch (error) {
    sendMessage(`setTokens - ${error}`);
  }
};

const setOldApi = async () => {
  const response = await fetch(`${process.env.API_MIGRATION_URL}/v1/chains/1/vaults/all`);
  if (response.status !== 200) {
    const { url, status, statusText } = response;
    const errorMessage = `HTTP to ${url} request failed (status ${status} ${statusText})`;
    sendMessage(errorMessage);
    throw new Error(errorMessage);
  }
  const json = await response.json();
  cache.set(VaultsAllCacheKey, json, VaultsAllCacheTime);
};

(async () => {
  await Promise.allSettled([setVaults(), setTokens(), setOldApi()]);
  process.exit(0);
})();
