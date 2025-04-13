import { FirebaseError } from "firebase/app";

/**
 * Gets a human-readable error message from a Firebase error.
 * Note: This is now used as a fallback for errors not specifically handled in components.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    // Return the raw error message for logging purposes
    return `${error.code}: ${error.message}`;
  }

  return "An unexpected error occurred. Please try again.";
};
