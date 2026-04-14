import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

export const getUserFromToken = async (token?: string) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user;
  } catch {
    return null;
  }
};