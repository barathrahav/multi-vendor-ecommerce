import { Request } from "express";
import { getUserFromToken } from "../middleware/auth.middleware";

export const createContext = async ({
  req,
}: {
  req: Request;
}) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.replace("Bearer ", "");

  const user = await getUserFromToken(token);

  return { req, user };
};