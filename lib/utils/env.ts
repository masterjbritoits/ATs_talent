/**
 * Reads an environment variable.
 * In production the app is expected to run with secrets already injected as
 * environment variables by the Azure App Service / Key Vault reference binding.
 * This helper is intentionally simple; secret loading happens at infrastructure
 * level, not at runtime inside the app.
 */
export function env(key: string, fallback = "") {
  return process.env[key] ?? fallback;
}

export function envBool(key: string, fallback = false) {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

/**
 * Requires a variable to be present. Throws at startup (not silently
 * falls back) so misconfigured deployments fail fast.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable "${key}" is not set. ` +
        `Ensure it is configured in Azure App Service application settings ` +
        `or via a Key Vault reference.`
    );
  }
  return value;
}

/** Returns true when running in a deployed Azure environment. */
export function isProduction() {
  return process.env.NODE_ENV === "production";
}
