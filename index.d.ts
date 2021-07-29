import { Yearn } from "@yfi/sdk";

declare module "fastify" {
  interface FastifyInstance {
    aaaaaaaaaa: Yearn<1>;
  }
}
