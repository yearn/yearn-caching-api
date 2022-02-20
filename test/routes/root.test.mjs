import { test } from "tap";
import { build } from "../helper.mjs";

test("default root route", async (t) => {
  const app = build(t);

  const res = await app.inject({
    url: "/",
  });
  t.same(JSON.parse(res.payload), { "message": "Welcome to the yearn.finance API." });
});
