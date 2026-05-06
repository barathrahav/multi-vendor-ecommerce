import { Request } from "express";
import { getUserFromToken } from "../middleware/auth.middleware";
import { createLoaders } from "../graphql/loaders";

export const createContext = async ({
  req,
}: {
  req: Request;
}) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.replace("Bearer ", "");

  const user = await getUserFromToken(token);
  const loaders = createLoaders();

  return {
    req,
    user,
    idempotencyKey: req.headers["idempotency-key"] as string | undefined,
    loaders,
  };
};
