import ms from "ms";
import fetch from "cross-fetch";

const LoanscanAllCacheKey = "loanscan.all";
const LoanscanAllCacheTime = ms("10 minutes");

/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/all", async (_, reply) => {
    let [hit, allVaults] = await api.helpers.cachedCall(
      () =>
        fetch(`${process.env.API_MIGRATION_URL}/v1/chains/1/loanscan/all`).then((res) =>
          res.json()
        ),
      LoanscanAllCacheKey,
      LoanscanAllCacheTime
    );

    reply.header("X-Cache-Hit", hit).send(allVaults);
  });
}
