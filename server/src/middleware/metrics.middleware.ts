import type { NextFunction, Request, Response } from "express";
import { recordRequestMetric } from "../config/metrics";

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    recordRequestMetric(req.path, Date.now() - startedAt, res.statusCode >= 400);
  });

  next();
};
