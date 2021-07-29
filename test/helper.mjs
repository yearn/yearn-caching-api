// Common test functions

import Fastify from "fastify";
import fp from "fastify-plugin";
import App from "../app.mjs";

export function config() {
  return {};
}

export function build(t) {
  const app = Fastify();
  app.register(fp(App), config());
  t.teardown(app.close.bind(app));
  return app;
}
