import { join, dirname } from "path";
import { fileURLToPath } from "url";

import AutoLoad from "fastify-autoload";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function (fastify, opts) {
  fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}
