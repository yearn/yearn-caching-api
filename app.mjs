import { join, dirname } from "path";
import { fileURLToPath } from "url";

import "dotenv/config";

import AutoLoad from "fastify-autoload";
import Bree from "bree";
import Graceful from "@ladjs/graceful";
import * as Sentry from "@sentry/node";
import SegfaultHandler from "segfault-handler";

import jobs from "./jobs/index.mjs";
import { CHAINS } from "./constants/chains.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const chainIdParamSchema = {
  $id: "chainIdParam",
  params: {
    type: "object",
    properties: {
      chainId: {
        type: "number",
        enum: CHAINS,
      },
    },
    required: ["chainId"],
  },
};

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export async function server(fastify, opts) {
  // enable SEGFAULT handler
  SegfaultHandler.registerHandler("crash.log", function (signal, address, stack) {
    console.log("*** RECEIVED SEGFAULT ***");
    console.log("node version: " + process.version);
    console.log("signal      : " + signal);
    console.log("address     : " + address);
    console.log("stack       :");
    for (const line of stack) {
      console.log(line);
    }
  });

  // sentry is enabled
  if (process.env.SENTRY_DSN) {
    setSentryErrorHandler(fastify);
  // sentry is disabled
  } else {
    setDefaultErrorHandler(fastify);
  }

  fastify.setNotFoundHandler({}, function (request, reply) {
    const { url, method } = request.raw;
    const message = `Route ${method}:${url} not found`;
    reply.code(404).send({
      message,
      error: "Not Found",
      statusCode: 404,
    });
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.addSchema(chainIdParamSchema);

  // bree needs at least one job to work
  if (jobs.length > 0) {
    const bree = new Bree({
      logger: fastify.log,
      defaultExtension: "mjs", // i'm a unicorn,
      jobs: jobs,
      errorHandler: (error, metadata) => {
        // sentry is enabled
        if (process.env.SENTRY_DSN) {
          Sentry.captureException(error, metadata);
        // sentry is disabled
        } else {
          console.log(error);
          console.log(metadata);
        }
      },
    });
    const graceful = new Graceful({ brees: [bree] });
    graceful.listen();
    bree.start();
    fastify.decorate("bree", bree);
  }
}

export async function setSentryErrorHandler(fastify) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
  });
  fastify.setErrorHandler(function (err, request, reply) {
    Sentry.withScope((scope) => {
      if (request.raw.ip) {
        scope.setUser({
          ip_address: request.raw.ip,
        });
      }
      scope.setTag("path", request.raw.url);
      Sentry.captureException(err);
    });
    return reply.send(err);
  });
}

export async function setDefaultErrorHandler(fastify) {
  fastify.setErrorHandler(function (err, request, reply) {
    console.log(err);
    return reply.send(err);
  });
}

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "1000", 10);

server.options = {
  requestTimeout: REQUEST_TIMEOUT,
};

export default server;
