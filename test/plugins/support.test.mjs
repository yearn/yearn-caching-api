import { test } from "tap";
import Fastify from "fastify";
import Support from "../../plugins/support.mjs";

test("support works standalone", async (t) => {
  const api = Fastify();
  api.register(Support);

  await api.ready();
  t.equal(api.someSupport(), "hugs");
});
