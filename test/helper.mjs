// Common test functions

import Fastify from "fastify";
import fp from "fastify-plugin";
import App from "../app.mjs";

export function config() {
  return {};
}

export function build(t) {
  const api = Fastify();
  api.register(fp(App), config());
  t.teardown(api.close.bind(api));
  return api;
}
