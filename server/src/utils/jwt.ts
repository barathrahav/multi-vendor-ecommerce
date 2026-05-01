import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export const generateToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    options
  );
};

export const generateRefreshToken = (userId: string, tokenId: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId, tokenId },
    process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string),
    options
  );
};
