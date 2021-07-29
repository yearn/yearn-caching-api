export default async function (fastify) {
  fastify.get("/", async function () {
    return { root: true };
  });
}
