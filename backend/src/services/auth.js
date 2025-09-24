import { CognitoJwtVerifier } from 'aws-jwt-verify';
import Cognito from "@aws-sdk/client-cognito-identity-provider"
import { secretHash } from '../utils/auth-utils.js';
import { PARAMETERS } from './paramenter-manager.js';
import { SECRET_STORE } from './secrets-manager.js';

export const accessVerifier = async () => {
    const userPool = await PARAMETERS.AWS_USER_POOL_ID()
    const clientId = await PARAMETERS.AWS_CLIENT_ID();

    return CognitoJwtVerifier.create({
        userPoolId: userPool,
        tokenUse: "access",
        clientId: clientId,
    })
}

export const idVerifier = async (token) => {
    const userPool = await PARAMETERS.AWS_USER_POOL_ID()
    const clientId = await PARAMETERS.AWS_CLIENT_ID();

    const idVerifier = CognitoJwtVerifier.create({
        userPoolId: userPool,
        tokenUse: "id",
        clientId: clientId,
    })

    return idVerifier.verify(token)
}

export const awsAuthenticate = async (username, password) => {
    const region = await PARAMETERS.AWS_REGION();
    const client = new Cognito.CognitoIdentityProviderClient({
        region: region
    })
    const clientSecret = await SECRET_STORE.AWS_CLIENT_SECRET();
    const clientId = await PARAMETERS.AWS_CLIENT_ID();

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