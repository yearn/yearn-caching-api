import fp from "fastify-plugin";

import { Yearn } from "@yfi/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER);

export const yearn = new Yearn(1, { provider, cache: { useCache: false } });

/**
 * This plugins adds an SDK instance to the fastify object
 *
 * @see https://github.com/yearn/yearn-sdk
 */
export default fp(async function (api) {
  api.decorate("sdk", yearn);
});
