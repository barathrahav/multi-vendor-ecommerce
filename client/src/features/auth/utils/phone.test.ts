import { describe, expect, it } from "vitest";

import { normalizePhone, splitPhone } from "./phone";

describe("phone utils", () => {
  it("splits a known country code and strips non-digits from the number", () => {
    expect(splitPhone("+91 98765-43210")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
  });

  it("falls back to India for unknown or missing country codes", () => {
    expect(splitPhone("98765 43210")).toEqual({
      countryCode: "+91",
      phoneNumber: "9876543210",
    });
  });

  it("normalizes a country code and phone number into an E.164-like value", () => {
    expect(normalizePhone("+1", "(555) 123-4567")).toBe("+15551234567");
  });

  it("returns undefined when there are no phone digits", () => {
    expect(normalizePhone("+91", " - ")).toBeUndefined();
  });
});
