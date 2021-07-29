/**
 * @param {import("fastify").FastifyInstance} api
 */
export default async function (api) {
  api.get("/", async () => {
    const vaults = api.sdk.vaults.get();
    return vaults;
  });
}
