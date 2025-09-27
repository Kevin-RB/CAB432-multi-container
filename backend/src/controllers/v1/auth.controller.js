import Cognito from "@aws-sdk/client-cognito-identity-provider"
import { secretHash } from "../../utils/auth-utils.js";
import { addUserToGroup, assoasiateSoftwareToken, awsAuthenticate, idVerifier, respondToMfaSetupChallenge, verifySoftwareToken } from "../../services/auth.js";
import { PARAMETERS } from "../../services/paramenter-manager.js";
import { SECRET_STORE } from "../../services/secrets-manager.js";
import axios from "axios";

export const authenticate = async (req, res) => {
    try {
        console.log("Getting auth token");
        const { username, password } = req.body;
        const initiateAuthResponse = await awsAuthenticate(username, password);
        console.log("Authentication response:", initiateAuthResponse);

        // Handle different challenge types
        switch (initiateAuthResponse.ChallengeName) {
            case 'MFA_SETUP':
                // First time MFA setup
                const associateTokenResponse = await assoasiateSoftwareToken(initiateAuthResponse.Session);
                console.log("Associate software token response:", associateTokenResponse);

                // Generate otpauth URL for TOTP apps
                const issuer = "cosmic-receipt";
                const user = initiateAuthResponse.ChallengeParameters.USER_ID_FOR_SRP ?? username;
                const label = `${issuer}:${user}`;
                const otpauth = `otpauth://totp/${encodeURIComponent(label)}?` + new URLSearchParams({
                    secret: associateTokenResponse.SecretCode,
                    issuer: issuer,
                }).toString();

                return res.json({
                    challengeName: 'MFA_SETUP',
                    message: "TOTP setup initiated",
                    otpauth,
                    userIdForSRP: initiateAuthResponse.ChallengeParameters.USER_ID_FOR_SRP,
                    session: associateTokenResponse.Session,
                });

            case 'SOFTWARE_TOKEN_MFA':
                // User has MFA already set up, needs to provide TOTP code
                return res.json({
                    challengeName: 'SOFTWARE_TOKEN_MFA',
                    message: "Please provide your TOTP code",
                    session: initiateAuthResponse.Session,
                    userIdForSRP: initiateAuthResponse.ChallengeParameters.USER_ID_FOR_SRP,
                });

            case undefined:
            case null:
                // No MFA challenge - authentication successful
                if (initiateAuthResponse.AuthenticationResult) {
                    return res.json({
                        message: "Authentication successful",
                        success: true,
                        tokens: initiateAuthResponse.AuthenticationResult
                    });
                }
                break;

            default:
                console.log(`Unhandled challenge: ${initiateAuthResponse.ChallengeName}`);
                return res.status(400).json({
                    error: `Unhandled authentication challenge: ${initiateAuthResponse.ChallengeName}`
                });
        }

        // Fallback for unexpected response structure
        return res.status(400).json({ error: "Unexpected authentication response" });

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


    try {
        const clientId = await PARAMETERS.AWS_CLIENT_ID();
        const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
        const region = await PARAMETERS.AWS_REGION();

        const client = new Cognito.CognitoIdentityProviderClient({ region: region });
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

    try {
        const clientId = await PARAMETERS.AWS_CLIENT_ID();
        const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
        const region = await PARAMETERS.AWS_REGION();

        const client = new Cognito.CognitoIdentityProviderClient({ region: region });
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

export const loginWithGoogle = async (req, res) => {
    const poolDomain = await PARAMETERS.COGNITO_POOL_DOMAIN();
    const authRoute = "/oauth2/authorize"
    const redirectUri = await getRedirectUri(req);

    try {
        const clientId = await PARAMETERS.AWS_CLIENT_ID();

        const googleUrl = new URL(`${poolDomain}${authRoute}`);
        console.log("Cognito Google OAuth URL:", googleUrl.toString());

        // Use URLSearchParams for proper encoding
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            identity_provider: 'Google',
            scope: 'openid email',
            prompt: 'login' // Force the consent screen to show every time
        });

        for (const [key, value] of params) {
            googleUrl.searchParams.append(key, value);
        }

        console.log("Redirecting to Google OAuth URL:", googleUrl.toString());
        res.json({ authUrl: googleUrl.toString() });
    } catch (error) {
        console.error("Error redirecting to Google OAuth:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const googleCallback = async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        console.error('OAuth error:', error);
        return res.json({ error: "OAuth error occurred" });
    }

    if (!code) {
        return res.json({ error: "No authorization code provided" });
    }

    try {
        const poolDomain = await PARAMETERS.COGNITO_POOL_DOMAIN();
        const clientId = await PARAMETERS.AWS_CLIENT_ID();
        const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
        const redirectUri = await getRedirectUri(req);

        const tokenResponse = await axios.post(`${poolDomain}/oauth2/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                code: code,
                redirect_uri: redirectUri
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });

        if (tokenResponse.statusText !== 'OK') {
            console.error("Token endpoint returned non-OK status:", tokenResponse.status);
            return res.json({ error: "Token request failed" });
        }

        const { id_token, access_token, refresh_token } = tokenResponse.data;

        // Verify the ID token to get user info
        const IdTokenVerifyResult = await idVerifier(id_token);
        console.log("Authenticated user:", IdTokenVerifyResult);

        // Optionally, add the user to a group if needed
        const addUserToGroupResponse = await addUserToGroup(IdTokenVerifyResult["cognito:username"], "admin");
        console.log("Add user to group response:", addUserToGroupResponse);

        if (!IdTokenVerifyResult["cognito:groups"].includes("admin")) {
            IdTokenVerifyResult["cognito:groups"].push("admin");
        }

        // Replicate the authenticate function logic to generate tokens for the user
        const sessionToken = generateSessionToken(IdTokenVerifyResult, { id_token, access_token, refresh_token }); // Implement this based on your auth system
        const frontendUrl = await getFrontendUrl(req);

        // Get frontend URL from parameter store or environment variable
        const redirectUrl = `${frontendUrl}/auth/success?token=${sessionToken}`;

        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        return res.json({ error: "Token exchange failed" });
    }
}

export const verifyTotpAndFinishSetup = async (req, res) => {
    const { authCode, session, userIdForSRP } = req.body;
    console.log("Verifying TOTP code:", authCode);
    if (!authCode) {
        return res.status(400).json({ error: "TOTP code is required" });
    }
    console.log("Using session:", session);
    if (!session) {
        return res.status(400).json({ error: "No MFA session found. Please login again." });
    }
    console.log("User ID for SRP:", userIdForSRP);
    if (!userIdForSRP) {
        return res.status(400).json({ error: "No user identifier found. Please login again." });
    }

    try {
        const verifyResponse = await verifySoftwareToken(session, authCode);
        console.log("TOTP verification response:", verifyResponse);

        if (verifyResponse.Status !== 'SUCCESS') {
            return res.status(400).json({ error: "Invalid TOTP code" });
        }

        const { Session: verifiedSession } = verifyResponse

        const mfaAuthChallengeResponse = await respondToMfaSetupChallenge(verifiedSession, userIdForSRP);
        console.log("MFA Auth Challenge response:", mfaAuthChallengeResponse);
        const idToken = mfaAuthChallengeResponse.AuthenticationResult.IdToken;

        const userDetails = await idVerifier(idToken);
        console.log("User details after MFA setup:", userDetails);

        const response = {
            message: "TOTP verified and setup complete",
            username: userDetails['cognito:username'],
            roles: userDetails['cognito:groups'] || [],
            idToken: idToken
        }

        res.json(response);
    } catch (error) {
        console.error("Error verifying TOTP code:", error);
        return res.status(400).json({ error: error.message || "TOTP verification failed" });
    }
}


// Helper functions with environment detection
async function getFrontendUrl(req) {
    // Check if running locally based on host
    const host = req.get('host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

    if (isLocal) {
        // For local development, use environment variable or default
        return 'http://localhost:3001';
    }

    // Fix: Add the https:// protocol
    const domainName = await PARAMETERS.DOMAIN_NAME();
    const fullUrl = `https://${domainName}`;
    console.log("Frontend URL constructed:", fullUrl);
    return fullUrl;
}

async function getRedirectUri(req) {
    console.log("Determining redirect URI based on environment");
    // Check if running locally based on host
    const host = req.get('host'); req.hostname;
    const callbackPath = '/api/v1/auth/google/callback';

    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

    if (isLocal) {
        // For local development
        return `http://${host}${callbackPath}`;
    }

    const baseUrl = await PARAMETERS.DOMAIN_NAME();
    const callbackUrl = new URL(callbackPath, `https://${baseUrl}`);
    console.log("Callback URL for production:", callbackUrl.toString());

    return callbackUrl.toString();
}

function generateSessionToken(IdTokenVerifyResult, cognitoTokens) {
    return Buffer.from(JSON.stringify({
        user: { ...IdTokenVerifyResult },
        authToken: cognitoTokens.id_token,
    })).toString('base64');
}