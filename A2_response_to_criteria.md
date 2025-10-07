Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Kevin Romero Bedoya
- **Student number:** n12112798
- **Partner name (if applicable):** Yi Jie Ang
- **Application name:** Cosmic Receipt App
- **Two line description:** Web application that uploads receipt images, runs OCR + LLM extraction to produce structured receipt data and recipe suggestions.
- **EC2 instance name or ID:**
i-09fdfda47a7e4ce51
------------------------------------------------

### Core - First data persistence service

- **AWS service name:** S3
- **What data is being stored?:** User-uploaded receipt images
- **Why is this service suited to this data?:** S3 is object storage optimized for binary files, we can our receipt images and later fetch them
- **Why is are the other services used not suitable for this data?:** DynamoDB and RDS are for structured records and not designed for large binary objects
- **Bucket/instance/table name:** n12112798-cosmic-storage 
- **Video timestamp:** 00:10
- **Relevant files:**
    - backend/src/services/s3-storage.js
    - backend/src/controllers/v1/upload.controller.js

### Core - Second data persistence service

- **AWS service name:** DynamoDB
- **What data is being stored?:** Receipt metadata and processing state (receiptId, owner, s3Key, processing status, fileInfo, createdAt, updatedAt).
- **Why is this service suited to this data?:** DynamoDB offers flexible schema, low-latency key-value access
- **Why is are the other services used not suitable for this data?:** S3 is for raw file storage (not efficient for querying metadata) and RDS would be heavier / unnecessary for the simple access patterns used.
- **Bucket/instance/table name:** n12112798-CosmicStorage
- **Video timestamp:** 00:16
- **Relevant files:**
    - backend/src/services/dynamoDB.js
    - backend/src/utils/dynamo-utils.js
    - backend/src/controllers/v1/upload.controller.js

### Third data service

- **AWS service name:**
- **What data is being stored?:**
- **Why is this service suited to this data?:**
- **Why is are the other services used not suitable for this data?:**
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n12112798-cosmic-storage
- **Video timestamp:** 01:14
- **Relevant files:**
    - backend/src/services/s3-storage.js

### In-memory cache

- **ElastiCache instance name:** n12112798-cosmic-cache
- **What data is being cached?:** Parameter store strings
- **Why is this data likely to be accessed frequently?:** Very likely as multiple functions require them to interface with AWS SDK
- **Video timestamp:** 01:34
- **Relevant files:**
    - backend/src/services/cache.js
    - backend/src/services/cachedParameters.js

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** Short-lived temporary files and intermediate LLM artifacts stored on the container filesystem during processing.
- **Why is this data not considered persistent state?:** LLM models are stored in the container volumes, and so is only persistent there
- **How does your application ensure data consistency if the app suddenly stops?:** Final file objects are written to S3 and metadata persisted to DynamoDB as part of processing flows, if something fails, the changes are rolled back
- **Relevant files:**
    - backend/src/services/secrets-manager.js
    - backend/src/services/dynamoDB.js
    - backend/src/services/s3-storage.js
    - backend/src/services/paramenter-manager.js

### Graceful handling of persistent connections

- **Type of persistent connection and use:** 
- **Method for handling lost connections:** 
- **Relevant files:**
    -

### Core - Authentication with Cognito

- **User pool name:** n12112798-user-pool
- **How are authentication tokens handled by the client?:** After successful authentication Cognito tokens (id/access tokens) are returned and used by the frontend for authenticated requests; tokens are stored in client state and attached to API requests.
- **Video timestamp:** 02:25
- **Relevant files:**
    - backend/src/services/auth.js
    - backend/src/controllers/v1/auth.controller.js

### Cognito multi-factor authentication

- **What factors are used for authentication:** Software TOTP (authenticator app) is implemented (setup and verify flows present).
- **Video timestamp:** 03:10
- **Relevant files:**
    - frontend/src/routes/(auth)/auth/totp-confirm.tsx
    - frontend/src/routes/(auth)/auth/mfa-verify.tsx
    - backend/src/controllers/v1/auth.controller.js
    - backend/src/services/auth.js

### Cognito federated identities

- **Identity providers used:** google
- **Video timestamp:** 04:06
- **Relevant files:**
    - backend/src/controllers/v1/auth.controller.js
    - backend/src/services/auth.js

### Cognito groups

- **How are groups used to set permissions?:** Users in the "admin" group are allowed to upload receipts, whereas users in the "users" group not
- **Video timestamp:** 04:25
- **Relevant files:**
    - backend/src/controllers/v1/auth.controller.js
    - backend/src/middleware/auth.js

### Core - DNS with Route53

- **Subdomain**: cosmic.cab432.com
- **Video timestamp:** 05:33

### Parameter store

- **Parameter names:** /n12112798/cosmic-receipt/aws_client_id, /n12112798/cosmic-receipt/aws_client_secret_name, /n12112798/cosmic-receipt/aws_s3_bucket_name, /n12112798/cosmic-receipt/aws_user_pool_id, 
/n12112798/cosmic-receipt/cognito-pool-domain, /n12112798/cosmic-receipt/domain-name, /n12112798/cosmic-receipt/dynamodb_table_name, 
/n12112798/cosmic-receipt/qut_username, /n12112798/cosmic-receipt/aws_region
- **Video timestamp:** 05:50
- **Relevant files:**
    - backend/src/services/paramenter-manager.js
    - backend/src/services/auth.js


### Secrets manager

- **Secrets names:** AWS_CLIENT_SECRET, YOUTUBE_API_KEY
- **Video timestamp:** 6:53
- **Relevant files:**
    - backend/src/services/secrets-manager.js
    - backend/src/services/auth.js

### Infrastructure as code

- **Technology used:**
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -