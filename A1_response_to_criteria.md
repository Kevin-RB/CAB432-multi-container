Assignment 1 - REST API Project - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Kevin Romero
- **Student number:** n12112798
- **Application name:** Cosmic Receipt
- **Two line description:** This app runs OCR and ollama to extract the grocery list from supermarket receipt photos and generate recipe recommendations.


Core criteria
------------------------------------------------

### Containerise the app

- **ECR Repository name:** n12112798-kr-m5
- **Video timestamp:** 0:50
- **Relevant files:**
    - frontend/Dockerfile
    - backend/Dockerfile
    - tesseract-ocr/Dockerfile
    - /docker-compose.prod.yml

### Deploy the container

- **EC2 instance ID:** i-0e83886135e6beb1b
- **Video timestamp:** 1:22

### User login

- **One line description:** hard-coded credentials for users. JWT for session management
- **Video timestamp:** 1:57
- **Relevant files:**
    - backend\src\controllers\v1\auth.controller.js
    - backend\src\utils\jwt-utils.js

### REST API

- **One line description:** REST API with endpoints, and appropiate HTTP methods and status code responses. enable clients interaction with the system
- **Video timestamp:** 2:16
- **Relevant files:**
    - backend\src\app.js
    - backend\src\routes\v1\auth.js
    - backend\src\routes\v1\receipts.js
    - backend\src\routes\v1\upload.js


### Data types

- **One line description:** Receipt Images and ORC-LLM extracted data from images (JSON)
- **Video timestamp:** 2:47
- **Relevant files:** 
    - backend\src\controllers\v1\upload.controller.js 10

#### First kind

- **One line description:** Receipt Images
- **Type:** Unstructured
- **Rationale:** stored in the uploads/ folder, used as source for data extraction
- **Video timestamp:** 2:50, 3:02
- **Relevant files:**
    - backend\src\routes\v1\upload.js 8
    - backend\src\services\multer.js

#### Second kind

- **One line description:** ORC-LLM data extracted & formatted from receipt images
- **Type:** unstructured
- **Rationale:** stored in-memory, used to display an item breakdown of receipt alongside with recipes suggestions
- **Video timestamp:** 2:55, 3:08
- **Relevant files:**
  - backend\src\controllers\v1\upload.controller.js 10
  - backend\src\services\ollama.js
  - backend\src\controllers\v1\receipts.controller.js 8

### CPU intensive task

 **One line description:** ollama local model is instructed to extract formatted data from a plain text (receipt ORC)
- **Video timestamp:**  3:23
- **Relevant files:**
    - backend\src\controllers\v1\upload.controller.js 42, 66
    - backend\src\services\ollama.js

### CPU load testing

 **One line description:** manually sending requests to extract data out of a receipt, one after another
- **Video timestamp:** 3:51
- **Relevant files:**
    - backend\src\controllers\v1\upload.controller.js 10
    - backend\src\routes\v1\upload.js 8

Additional criteria
------------------------------------------------

### Extensive REST API features

- **One line description:** Middleware admin verification | receipt paginated endpoint
- **Video timestamp:** 2:38, 3:40
- **Relevant files:**
    - backend\src\middleware\auth.js
    - backend\src\routes\v1\receipts.js 11
    - backend\src\controllers\v1\receipts.controller.js 31

### External API(s)

- **One line description:** Youtube API, search videos based on the recipe suggestions generated
- **Video timestamp:** 4:42
- **Relevant files:**
    - frontend\src\hooks\use-youtube.ts
    - frontend\src\components\receipt-details\videos\video-showcase.tsx

### Additional types of data

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### Custom processing

- **One line description:** ollama prompt engineering and parameter modification to achieve deterministic & creative responses
- **Video timestamp:** 3:40
- **Relevant files:**
    - backend\src\services\ollama.js
    - backend\src\config\index.js 25

### Infrastructure as code

- **One line description:** docker compose to spin up all necessary containers
- **Video timestamp:** 1:38
- **Relevant files:**
    - docker-compose.prod.yml

### Web client

- **One line description:** Web application to showcase project functionality (Vite + React)
- **Video timestamp:** 4:30
- **Relevant files:**
    - frontend
    
### Upon request

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 