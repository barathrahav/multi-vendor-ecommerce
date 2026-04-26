import { CombinedGraphQLErrors } from "@apollo/client/errors";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const getErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE
) => {
  if (!error) {
    return fallback;
  }

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((entry) => entry.message).join(", ") || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
};

export const reportError = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE
) => {
  const message = getErrorMessage(error, fallback);
  console.error(message, error);
  return message;
};
