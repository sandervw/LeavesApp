// Validates that the env is actually a string
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

// List of secret names that should be loaded from Key Vault in production
// Only includes actual secrets (credentials, API keys, signing secrets)
// Configuration values (NODE_ENV, PORT, MAX_TREE_DEPTH, KEY_VAULT_URL, APP_ORIGIN)
//   should be set as environment variables in Azure App Service, not in Key Vault
export const SECRET_NAMES = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_SENDER',
  'RESEND_API_KEY',
] as const;

export const NODE_ENV = getEnv("NODE_ENV", "development");
export const PORT = getEnv('PORT', '8080');
// MONGO_URI is optional in test mode (will use MongoDB Memory Server)
export const MONGO_URI = NODE_ENV === "test" ? (process.env.MONGO_URI || "") : getEnv('MONGO_URI');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const MAX_TREE_DEPTH = parseInt(getEnv("MAX_TREE_DEPTH", "25"), 10);
export const KEY_VAULT_URL = getEnv("KEY_VAULT_URL", "");