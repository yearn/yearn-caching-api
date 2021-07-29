/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default async function (fastify) {
  fastify.get("/", async () => {
    return { root: false };
  });
}
