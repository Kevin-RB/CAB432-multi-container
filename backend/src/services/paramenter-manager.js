
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({});

export const PARAMETERS = {
  AWS_S3_BUCKET_NAME: async () => await fetchParameters("aws_s3_bucket_name"),
  DYNAMODB_TABLE_NAME: async () => await fetchParameters("dynamodb_table_name"),
  QUT_USERNAME: async () => await fetchParameters("qut_username"),
  AWS_USER_POOL_ID: async () => await fetchParameters("aws_user_pool_id"),
  AWS_CLIENT_ID: async () => await fetchParameters("aws_client_id"),
  AWS_REGION: async () => await fetchParameters("aws_region"),
  AWS_CLIENT_SECRET_NAME: async () => await fetchParameters("aws_client_secret_name"),
  DOMAIN_NAME: async () => await fetchParameters("domain-name"),
  COGNITO_POOL_DOMAIN: async () => await fetchParameters("cognito-pool-domain"),
}

const fetchParameters = async (parameter) => {
    // console.log("Fetching parameter:", parameter);
    try {
        const parameterBase = "/n12112798/cosmic-receipt/";
        const completeParameterPath = `${parameterBase}${parameter}`;

        const command = new GetParameterCommand({
            Name: completeParameterPath
        });

        const response = await client.send(command);
        return response.Parameter.Value;
    } catch (error) {
        console.log("Error fetching parameter:", error);
        throw error;
    }
};
