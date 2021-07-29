import { Yearn } from "@yfi/sdk";

declare module "fastify" {
  interface FastifyInstance {
    sdk: Yearn<1>;
  }
}
