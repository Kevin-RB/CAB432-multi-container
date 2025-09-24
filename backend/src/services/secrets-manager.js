
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { PARAMETERS } from "./paramenter-manager.js";

const client = new SecretsManagerClient({});

export const SECRET_STORE = {
    AWS_CLIENT_SECRET: async () => await fetchSecrets("AWS_CLIENT_SECRET"),
    YOUTUBE_API_KEY: async () => await fetchSecrets("YOUTUBE_API_KEY")
};

const fetchSecrets = async (key) => {
    console.log("Fetching secret:", key);
    const secretName = await PARAMETERS.AWS_CLIENT_SECRET_NAME();

    try {
        const command = new GetSecretValueCommand({
            SecretId: secretName,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        });
        const response = await client.send(command);

        const secret = JSON.parse(response.SecretString);

        if (!(key in secret)) throw new Error(`Key ${key} not found in secret`);
  
        return secret[key];
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.log("Error fetching secret:", error);
        throw error;
    }
};
