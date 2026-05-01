import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { generateRefreshToken, generateToken } from "../../utils/jwt";
import { notificationEvents } from "../notifications/notification.service";
import { emailSchema, otpSchema, passwordSchema, phoneSchema } from "../../utils/validation";

const hashValue = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const createAuthPayload = async (user: any) => {
  const refreshRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id, refreshRecord.id);

  await prisma.refreshToken.update({
    where: { id: refreshRecord.id },
    data: { tokenHash: hashValue(refreshToken) },
  });

  return { token, refreshToken, user };
};

const sendOtpSms = async (phone: string, code: string) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;
  const message = `${process.env.APP_NAME || "E-Commerce"} OTP: ${code}. It expires in 5 minutes.`;

  if (!sid || !token || !from || sid === "..." || token === "...") {
    console.info("[otp:sms]", { to: phone, message });
    return;
  }

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    throw new Error(`OTP SMS failed with ${response.status}`);
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: "ADMIN" | "VENDOR" | "CUSTOMER" = "CUSTOMER"
) => {
  const parsedEmail = emailSchema.parse(email);
  const parsedPassword = passwordSchema.parse(password);
  const parsedPhone = phone ? phoneSchema.parse(phone) : undefined;
  const existingUser = await prisma.user.findUnique({
    where: { email: parsedEmail },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(parsedPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: parsedEmail,
      phone: parsedPhone || null,
      password: hashedPassword,
      role,
    },
  });

  await notificationEvents.signup(user);

  return createAuthPayload(user);
};

export const loginUser = async (email: string, password: string) => {
  const parsedEmail = emailSchema.parse(email);
  const parsedPassword = passwordSchema.parse(password);
  const user = await prisma.user.findUnique({
    where: { email: parsedEmail },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(parsedPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  await notificationEvents.login(user);

  return createAuthPayload(user);
};

export const requestOtpService = async (phone: string) => {
  const parsedPhone = phoneSchema.parse(phone);
  const user = await prisma.user.findFirst({
    where: { phone: parsedPhone },
  });

  if (!user) {
    throw new Error("No user found with this phone number");
  }

  const recentAttempts = await prisma.otpCode.count({
    where: {
      phone: parsedPhone,
      purpose: "LOGIN",
      createdAt: {
        gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    },
  });

  if (recentAttempts >= 5) {
    throw new Error("Too many OTP requests. Try again later.");
  }

  const code = String(crypto.randomInt(100000, 999999));

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      phone: parsedPhone,
      purpose: "LOGIN",
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await sendOtpSms(parsedPhone, code);

  return "OTP sent";
};

export const verifyOtpLoginService = async (phone: string, code: string) => {
  const parsedPhone = phoneSchema.parse(phone);
  const parsedCode = otpSchema.parse(code);
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone: parsedPhone,
      purpose: "LOGIN",
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  if (!otp || !otp.user) {
    throw new Error("Invalid or expired OTP");
  }

  if (otp.attempts >= 5) {
    throw new Error("OTP locked. Request a new code.");
  }

  const isValid = await bcrypt.compare(parsedCode, otp.codeHash);

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: {
      attempts: { increment: 1 },
      consumedAt: isValid ? new Date() : undefined,
    },
  });

  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  await notificationEvents.login(otp.user);

  return createAuthPayload(otp.user);
};

export const refreshTokenService = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string)
  ) as { userId: string; tokenId: string };
  const record = await prisma.refreshToken.findUnique({
    where: { id: decoded.tokenId },
    include: { user: true },
  });

  if (
    !record ||
    record.revokedAt ||
    record.expiresAt < new Date() ||
    record.tokenHash !== hashValue(refreshToken)
  ) {
    throw new Error("Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  return createAuthPayload(record.user);
};
