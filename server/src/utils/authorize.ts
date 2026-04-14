export const authorizeRoles = (
  userRole: string | undefined,
  allowedRoles: string[]
) => {
  if (!userRole) {
    throw new Error("Unauthorized");
  }

  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }
};