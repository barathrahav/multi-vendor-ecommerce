import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./context";
import { logger } from "./config/logger";
import { getMetricsSnapshot } from "./config/metrics";
import { initRealtime } from "./config/realtime";
import { apiRateLimiter, otpRateLimiter } from "./middleware/rateLimit";
import { metricsMiddleware } from "./middleware/metrics.middleware";

const startServer = async () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    });
  }

  const app = express();
  const httpServer = http.createServer(app);
  const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(pinoHttp({ logger }));
  app.use(metricsMiddleware);
  app.use(apiRateLimiter);
  app.use(express.json());
  app.use("/graphql", (req, res, next) => {
    const body = req.body as any;
    const operationName =
      body?.operationName || body?.query?.match(/mutation\s+(\w+)/)?.[1];

    if (
      operationName &&
      ["RequestOtp", "VerifyOtpLogin", "requestOtp", "verifyOtpLogin"].includes(
        operationName
      )
    ) {
      return otpRateLimiter(req, res, next);
    }

    return next();
  });

  app.get("/metrics", (_req, res) => {
    res.json(getMetricsSnapshot());
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(formattedError);
      }

      logger.error({ error: formattedError }, "GraphQL error");
      return formattedError;
    },
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: createContext,
    })
  );

  initRealtime(httpServer);

  httpServer.listen(5000, () => {
    logger.info("Server running at http://localhost:5000/graphql");
  });
};

startServer();
