
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: "ap-southeast-2" });

export const PARAMETERS = {
  AWS_S3_BUCKET_NAME: async () => await fetchParameters("aws_s3_bucket_name"),
  DYNAMODB_TABLE_NAME: async () => await fetchParameters("dynamodb_table_name"),
  QUT_USERNAME: async () => await fetchParameters("qut_username"),
}

const fetchParameters = async (parameter) => {
    console.log("Fetching parameter:", parameter);

    try {
        const parameterBase = "/n12112798/cosmic-receipt/";
        const completeParameterPath = `${parameterBase}${parameter}`;

        console.log("Full parameter path:", completeParameterPath);

        const command = new GetParameterCommand({
            Name: completeParameterPath
        });

        const response = await client.send(command);
        console.log("Fetched parameter value:", response);

        return response.Parameter.Value;
    } catch (error) {
        console.log("Error fetching parameter:", error);
        throw error;
    }
};
