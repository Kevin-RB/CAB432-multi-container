import { CognitoJwtVerifier } from 'aws-jwt-verify';
import Cognito from "@aws-sdk/client-cognito-identity-provider"
import { secretHash } from '../utils/auth-utils.js';

export const accessVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.AWS_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.AWS_CLIENT_ID,
})

export const idVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.AWS_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.AWS_CLIENT_ID,
});

export const awsAuthenticate = async (username, password) => {
    const client = new Cognito.CognitoIdentityProviderClient({
        region: process.env.AWS_REGION
    })

    const clientId = process.env.AWS_CLIENT_ID;
    const clientSecret = process.env.AWS_CLIENT_SECRET;

    const command = new Cognito.InitiateAuthCommand({
        AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash(clientId, clientSecret, username),
        },
        ClientId: clientId,
    })

    return client.send(command);
}