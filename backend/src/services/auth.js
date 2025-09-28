import { 
    cachedAWSUserPoolId,
    cachedAWSClientId,
    cachedAWSRegion 
} from './cachedParameters.js';
import { SECRET_STORE } from './secrets-manager.js';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import * as Cognito from '@aws-sdk/client-cognito-identity-provider';
import { secretHash } from '../utils/auth-utils.js';

export const accessVerifier = async () => {
    const userPool = await cachedAWSUserPoolId();
    const clientId = await cachedAWSClientId();

    return CognitoJwtVerifier.create({
        userPoolId: userPool,
        tokenUse: "access",
        clientId: clientId,
    });
}

export const idVerifier = async (token) => {
    const userPool = await cachedAWSUserPoolId();
    const clientId = await cachedAWSClientId();

    const verifier = CognitoJwtVerifier.create({
        userPoolId: userPool,
        tokenUse: "id",
        clientId: clientId,
    });

    return verifier.verify(token);
}

export const awsAuthenticate = async (username, password) => {
    const region = await cachedAWSRegion();
    const client = new Cognito.CognitoIdentityProviderClient({
        region: region
    });
    
    const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
    const clientId = await cachedAWSClientId();

    const command = new Cognito.InitiateAuthCommand({
        AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash(clientId, clientSecret, username),
        },
        ClientId: clientId,
    });

    return client.send(command);
}

export const assoasiateSoftwareToken = async (session) => {
    const region = await cachedAWSRegion();
    const client = new Cognito.CognitoIdentityProviderClient({
        region: region
    });
    
    const command = new Cognito.AssociateSoftwareTokenCommand({
        Session: session
    });

    return client.send(command);
}

export const verifySoftwareToken = async (session, authCode) => {
    const region = await cachedAWSRegion();
    const client = new Cognito.CognitoIdentityProviderClient({
        region: region
    });
    
    const command = new Cognito.VerifySoftwareTokenCommand({
        Session: session,
        UserCode: authCode,
        FriendlyDeviceName: "User's device"
    });

    return client.send(command);
}

export async function addUserToGroup(username, groupName) {
    try {
        const USER_POOL_ID = await cachedAWSUserPoolId();
        const region = await cachedAWSRegion();

        const client = new Cognito.CognitoIdentityProviderClient({ region: region });

        const command = new Cognito.AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            GroupName: groupName
        });

        const response = await client.send(command);
        return response;
    } catch (error) {
        console.error("Error adding user to group:", error);
        throw error;
    }
}

export const respondToMfaSetupChallenge = async (session, user) => {
    try {
        const region = await cachedAWSRegion();
        const clientId = await cachedAWSClientId();
        const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
        const client = new Cognito.CognitoIdentityProviderClient({ region: region });

        const command = new Cognito.RespondToAuthChallengeCommand({
            ChallengeName: "MFA_SETUP",
            ClientId: clientId,
            Session: session,
            ChallengeResponses: {
                "USERNAME": user,
                "SECRET_HASH": secretHash(clientId, clientSecret, user)
            }
        });
        
        return await client.send(command);
    } catch (error) {
        console.error("Error responding to auth challenge:", error);
        throw error;
    }
}

export const respondToMFAChallenge = async (session, user, authCode) => {
    try {
        const region = await cachedAWSRegion();
        const clientId = await cachedAWSClientId();
        const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
        const client = new Cognito.CognitoIdentityProviderClient({ region: region });

        const command = new Cognito.RespondToAuthChallengeCommand({
            ChallengeName: "SOFTWARE_TOKEN_MFA",
            ClientId: clientId,
            Session: session,
            ChallengeResponses: {
                "USERNAME": user,
                "SECRET_HASH": secretHash(clientId, clientSecret, user),
                "SOFTWARE_TOKEN_MFA_CODE": authCode
            }
        })
        return await client.send(command);
    } catch (error) {
        console.error("Error responding to MFA challenge:", error);
        throw error;
    }
}