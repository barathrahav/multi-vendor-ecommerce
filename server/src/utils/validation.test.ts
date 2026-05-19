import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { emailSchema, otpSchema, passwordSchema, phoneSchema } from "./validation";

describe("validation schemas", () => {
  it("normalizes valid email addresses", () => {
    assert.equal(emailSchema.parse("USER@Example.COM"), "user@example.com");
  });

  it("rejects invalid email addresses", () => {
    assert.throws(() => emailSchema.parse("not-an-email"));
  });

  it("accepts passwords inside the configured length bounds", () => {
    assert.equal(passwordSchema.parse("secret1"), "secret1");
  });

  it("rejects short passwords", () => {
    assert.throws(() => passwordSchema.parse("12345"));
  });

  it("accepts phone numbers with a country code", () => {
    assert.equal(phoneSchema.parse("+919444301708"), "+919444301708");
  });

  it("rejects OTP values that are not exactly six digits", () => {
    assert.throws(() => otpSchema.parse("12345"));
    assert.throws(() => otpSchema.parse("12345a"));
  });
});
