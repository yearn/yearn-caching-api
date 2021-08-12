import ms from "ms";

const LoanscanAllCacheKey = "loanscan.all";
const LoanscanAllCacheTime = ms("10 minutes");

const OldAPI = 'https://d28fcsszptni1s.cloudfront.net/v1/chains/1/loanscan'

/**
 * @param {import("fastify").FastifyInstance} api
 */
 export default async function (api) {
    api.get("/all", async (_, reply) => {
        let [hit, allVaults] = await api.helpers.cachedCall(
          () => fetch(`${OldAPI}/all`).then(res => res.json()),
          LoanscanAllCacheKey,
          LoanscanAllCacheTime
        );
    
        reply.header("X-Cache-Hit", hit).send(allVaults)
      })
 }