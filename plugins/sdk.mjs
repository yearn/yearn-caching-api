import fp from "fastify-plugin";

import { Yearn } from "@yfi/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";

const alchemy =
  "https://eth-mainnet.alchemyapi.io/v2/OIKkFA7d7MkWdy-hCy-nyJhI5C9APhu1";
const provider = new JsonRpcProvider(alchemy);

const yearn = new Yearn(1, { provider });

/**
 * This plugins adds an SDK instance to the fastify object
 *
 * @see https://github.com/yearn/yearn-sdk
 */
export default fp(async function (fastify) {
  fastify.decorate("sdk", yearn);
});
