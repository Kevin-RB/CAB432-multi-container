
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "n12112798-cosmic-receipt";

const client = new SecretsManagerClient({
    region: "ap-southeast-2",
});

export const SECRET_STORE = {
    AWS_CLIENT_SECRET: async () => await fetchSecrets("AWS_CLIENT_SECRET"),
};

const fetchSecrets = async (key) => {
    console.log("Fetching secret:", key);

    try {
        const command = new GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        });
        const response = await client.send(command);

        const secret = JSON.parse(response.SecretString);
        SECRET_STORE[key] = secret[key];

        return secret[key];
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.log("Error fetching secret:", error);
        throw error;
    }
};
