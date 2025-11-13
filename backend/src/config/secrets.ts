import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity"; // Managed Identity
import { SECRET_NAMES } from "../constants/env";

const vaultName = process.env.KEY_VAULT_URL;
let getSecret: (name: string) => Promise<string | undefined>;
if (process.env.NODE_ENV === "production" && vaultName) {
  const client = new SecretClient(
    vaultName,
    new DefaultAzureCredential()
  );

  getSecret = async (name: string) => {
    const secret = await client.getSecret(name);
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
 * Pre-loads all secrets from Key Vault (in production) into process.env
 * before the app starts. In development, secrets are already in process.env
 * from the .env file.
 */
export const initializeSecrets = async (): Promise<void> => {
  if (process.env.NODE_ENV === "production" && vaultName) {
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