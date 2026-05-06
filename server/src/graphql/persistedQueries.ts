import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { type Request, type Response, type NextFunction } from "express";

const storePath = path.resolve(__dirname, "persisted-queries.json");

const loadStore = (): Record<string, string> => {
  try {
    const raw = fs.readFileSync(storePath, { encoding: "utf-8" });
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveStore = (store: Record<string, string>) => {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), { encoding: "utf-8" });
};

const computeHash = (query: string) => {
  return createHash("sha256").update(query).digest("hex");
};

export const persistedQueriesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body as Record<string, any> | undefined;
  const persistedQueriesEnabled = process.env.PERSISTED_QUERIES_ENABLED === "true";
  const allowDirectQueries = !persistedQueriesEnabled || process.env.PERSISTED_QUERIES_ALLOW_DIRECT === "true";
  const autoRegister = process.env.PERSISTED_QUERIES_AUTO_REGISTER === "true";

  if (!body || typeof body !== "object") {
    return next();
  }

  const persisted = body.extensions?.persistedQuery;

  if (!persisted) {
    if (persistedQueriesEnabled && !allowDirectQueries) {
      return res.status(400).json({
        errors: [
          {
            message:
              "Persisted queries are enabled. Send a persisted query hash or enable direct queries.",
          },
        ],
      });
    }

    return next();
  }

  const queryHash = persisted.sha256Hash;
  if (!queryHash) {
    return res.status(400).json({
      errors: [
        {
          message: "Persisted query must include a sha256Hash.",
        },
      ],
    });
  }

  const store = loadStore();
  const savedQuery = store[queryHash];

  if (!body.query) {
    if (!savedQuery) {
      return res.status(404).json({
        errors: [
          {
            message:
              "Persisted query not found. Register the persisted query hash or send the full query.",
          },
        ],
      });
    }

    req.body.query = savedQuery;
    return next();
  }

  const providedHash = computeHash(body.query);
  if (providedHash !== queryHash) {
    return res.status(400).json({
      errors: [
        {
          message: "Persisted query hash does not match the provided query.",
        },
      ],
    });
  }

  if (autoRegister && !savedQuery) {
    store[queryHash] = body.query;
    saveStore(store);
  }

  return next();
};
