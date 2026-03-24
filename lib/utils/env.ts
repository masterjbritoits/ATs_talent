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
