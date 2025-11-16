import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity"; // Managed Identity
import { SECRET_NAMES } from "../constants/env";

/**
 * Converts environment variable names to Key Vault secret names.
 * Node.js uses underscores (JWT_SECRET), Azure Key Vault uses hyphens (JWT-SECRET).
 */
const toKeyVaultName = (envName: string): string => {
  return envName.replace(/_/g, '-');
};

const vaultName = process.env.KEY_VAULT_URL;
let getSecret: (name: string) => Promise<string | undefined>;
if (vaultName) {
  const client = new SecretClient(
    vaultName,
    new DefaultAzureCredential()
  );

  getSecret = async (name: string) => {
    // Convert underscore-based env var name to hyphen-based Key Vault name
    const secret = await client.getSecret(toKeyVaultName(name));
    return secret.value;
  };
} else {
  // Development: use .env
  getSecret = async (name: string) => {
    return process.env[name];
  };
}

export const getSecretValue = getSecret;

/**
 * Pre-loads all secrets from Key Vault into process.env
 * before the app starts. In development, secrets are already in process.env
 * from the .env file.
 */
export const initializeSecrets = async (): Promise<void> => {
  if (vaultName) {
    // Fetch all secrets in parallel and populate process.env
    await Promise.all(
      SECRET_NAMES.map(async (name) => {
        const value = await getSecret(name);
        if (value) {
          process.env[name] = value;
        }
      })
    );
  }
  // In development, process.env is already populated from .env file
};