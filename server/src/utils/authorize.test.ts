import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { authorizeRoles } from "./authorize";

describe("authorizeRoles", () => {
  it("allows users with an accepted role", () => {
    assert.doesNotThrow(() => authorizeRoles("ADMIN", ["ADMIN", "VENDOR"]));
  });

  it("throws Unauthorized when no role is present", () => {
    assert.throws(() => authorizeRoles(undefined, ["ADMIN"]), {
      message: "Unauthorized",
    });
  });

  it("throws Forbidden when the role is not accepted", () => {
    assert.throws(() => authorizeRoles("CUSTOMER", ["ADMIN"]), {
      message: "Forbidden",
    });
  });
});
