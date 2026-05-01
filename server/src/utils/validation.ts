import { z } from "zod";

export const emailSchema = z.string().email().trim().toLowerCase();
export const passwordSchema = z.string().min(6).max(128);
export const phoneSchema = z
  .string()
  .regex(/^\+\d{8,15}$/, "Phone must include country code, e.g. +919444301708");
export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be 6 digits");
