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

  // Check if Twilio credentials are configured
  if (!sid || !token || !from || sid === "..." || token === "...") {
    console.error("[otp:sms]", "Twilio credentials not configured");
    throw new Error("SMS service not configured. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_PHONE environment variables.");
  }

  // Validate phone number format
  if (!phone || !phone.match(/^\+\d{8,15}$/)) {
    throw new Error("Invalid phone number format. Must be in E.164 format (e.g., +1234567890)");
  }

  try {
    // Ensure phone number is in E.164 format
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const body = new URLSearchParams({
      To: formattedPhone,
      From: from,
      Body: message,
    });

    console.info("[otp:sms:sending]", { to: formattedPhone, from, messageLength: message.length });

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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      console.error("[otp:sms:error]", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        to: formattedPhone,
        from,
      });

      // Throw specific error based on status code and Twilio error codes
      if (response.status === 400) {
        if (typeof errorData === 'object' && errorData.code) {
          switch (errorData.code) {
            case 21211:
              throw new Error("Invalid 'To' phone number");
            case 21212:
              throw new Error("Invalid 'From' phone number");
            case 21213:
              throw new Error("'From' phone number is not verified");
            case 21214:
              throw new Error("Phone number is not SMS-capable");
            case 21215:
              throw new Error("Phone number is blacklisted");
            case 21216:
              throw new Error("Phone number is not owned by your account");
            case 21217:
              throw new Error("'From' phone number is not SMS-capable");
            default:
              throw new Error(`Twilio error: ${errorData.message || 'Invalid request'}`);
          }
        }
        throw new Error("Invalid phone number or message format");
      } else if (response.status === 401) {
        throw new Error("Twilio authentication failed. Check your Account SID and Auth Token.");
      } else if (response.status === 403) {
        throw new Error("Twilio account not authorized for SMS. Please upgrade your account.");
      } else if (response.status === 404) {
        throw new Error("Twilio API endpoint not found");
      } else {
        throw new Error(`SMS delivery failed: ${response.status} ${response.statusText}`);
      }
    }

    const responseData = await response.json();
    console.info("[otp:sms:success]", {
      sid: responseData.sid,
      to: formattedPhone,
      status: responseData.status,
      price: responseData.price,
    });

  } catch (error) {
    console.error("[otp:sms:network-error]", {
      error: error instanceof Error ? error.message : String(error),
      to: phone
    });
    throw error; // Re-throw to fail the OTP request
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

  return "OTP sent successfully";
};

export const requestOtpRegisterService = async (phone: string) => {
  const parsedPhone = phoneSchema.parse(phone);

  // Check if user already exists with this phone
  const existingUser = await prisma.user.findFirst({
    where: { phone: parsedPhone },
  });

  if (existingUser) {
    throw new Error("User already exists with this phone number");
  }

  const recentAttempts = await prisma.otpCode.count({
    where: {
      phone: parsedPhone,
      purpose: "REGISTER",
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
      phone: parsedPhone,
      purpose: "REGISTER",
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await sendOtpSms(parsedPhone, code);

  return "OTP sent successfully";
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

export const verifyOtpRegisterService = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  code: string,
  role: "ADMIN" | "VENDOR" | "CUSTOMER" = "CUSTOMER"
) => {
  const parsedPhone = phoneSchema.parse(phone);
  const parsedCode = otpSchema.parse(code);
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone: parsedPhone,
      purpose: "REGISTER",
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
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

  // Now register the user
  const parsedEmail = emailSchema.parse(email);
  const parsedPassword = passwordSchema.parse(password);

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
      phone: parsedPhone,
      password: hashedPassword,
      role,
    },
  });

  await notificationEvents.signup(user);

  return createAuthPayload(user);
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
