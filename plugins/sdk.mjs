import fp from "fastify-plugin";

import { Yearn } from "@yfi/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER);
const yearn = new Yearn(1, { provider, cache: { useCache: false } });

const providerFtm = new JsonRpcProvider("https://rpc.ftm.tools/");
const yearnFtm = new Yearn(250, { provider: providerFtm, cache: { useCache: false } });

export const sdks = {
  1: yearn,
  250: yearnFtm,
};

const getSdk = (chainId) => {
  return sdks[chainId];
};

/**
 * This plugins adds an SDK instance to the fastify object
 *
 * @see https://github.com/yearn/yearn-sdk
 */
export default fp(async function (api) {
  api.decorate("sdk", yearn);
  api.decorate("getSdk", getSdk);
});
