import { generateAccessToken } from "../../services/auth.js";
import { users } from "../../utils/jwt-utils.js";
import Cognito from "@aws-sdk/client-cognito-identity-provider"
import crypto from "crypto";

export const login = (req, res) => {
    console.log("Attempting login for user", req.body.username);
    // Check the username and password
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const user = users[username];

    if (!user || password !== user.password) {
        return res.status(401).json({ error: "Invalid username or password, please try again" });
    }

    // Get a new authentication token and send it back to the client
    console.log("Successful login by user", username);
    const token = generateAccessToken({ user });
    res.json({ authToken: token });
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

const secretHash = (clientId, clientSecret, username) => {
    const hasher = crypto.createHmac('sha256', clientSecret);
    hasher.update(`${username}${clientId}`);
    return hasher.digest('base64');
}