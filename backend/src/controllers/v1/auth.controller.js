import Cognito from "@aws-sdk/client-cognito-identity-provider"
import { secretHash } from "../../utils/auth-utils.js";
import { awsAuthenticate, idVerifier } from "../../services/auth.js";

export const authenticate = async (req, res) => {
    try {
        console.log("Getting auth token");
        const { username, password } = req.body;
        const response = await awsAuthenticate(username, password);

        const IdToken = response.AuthenticationResult.IdToken;
        const IdTokenVerifyResult = await idVerifier.verify(IdToken);

        res.json({ 
            message: "Authentication successful",
            authToken: IdToken,
            user: IdTokenVerifyResult,
            data: response 
        });
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const signup = async (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ error: "Username, password, and email are required" });
    }

    const { email, password, username } = req.body;

    const clientId = process.env.AWS_CLIENT_ID;
    const clientSecret = process.env.AWS_CLIENT_SECRET;

    try {
        const client = new Cognito.CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
        const command = new Cognito.SignUpCommand({
            ClientId: clientId,
            SecretHash: secretHash(clientId, clientSecret, username),
            Username: username,
            Password: password,
            UserAttributes: [{ Name: "email", Value: email }],
        })

        const response = await client.send(command);
        console.log(response);
        res.json({ message: "Signup successful", data: response });
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).json({ error: "Signup failed" });
    }
}

export const confirmSignup = async (req, res) => {
    if (!req.body.username || !req.body.code) {
        console.log("Missing username or confirmation code");
        return res.status(400).json({ error: "confirmation code is required" });
    }

    const clientId = process.env.AWS_CLIENT_ID;
    const clientSecret = process.env.AWS_CLIENT_SECRET;

    try {
        const client = new Cognito.CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
        const command = new Cognito.ConfirmSignUpCommand({
            ClientId: clientId,
            SecretHash: secretHash(clientId, clientSecret, req.body.username),
            Username: req.body.username,
            ConfirmationCode: req.body.code,
        });

        const response = await client.send(command);
        console.log(response);
        res.json({ message: "User confirmed successfully", data: response });
    } catch (error) {
        console.error("Error confirming user:", error);
        res.status(400).json({ error: error.message || "Confirmation failed" });
    }
}