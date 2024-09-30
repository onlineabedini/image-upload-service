# image-upload-service

## Project description
This project is a backend service developed with TypeScript, Express, and TypeORM that enables users to upload images, which are then stored in AWS S3. An asynchronous worker listens to an AWS SQS queue to process these images by generating thumbnails using Sharp. The thumbnails are uploaded back to S3, and the image metadata in the database is updated accordingly. Upon successful processing, the service sends email notifications via AWS SES to configured recipients. Additionally, the application allows users to add comments to images. By leveraging AWS services like S3 for storage, SQS for messaging, and SES for email notifications, the project ensures efficient, scalable, and robust handling of image uploads, processing, storage, and user interactions.

<br>

## Setup instructions
Prerequisites
- Node.js and npm: Ensure you have Node.js (v14 or later) and npm installed.
- TypeScript: Globally install TypeScript if not already installed:
```
npm install -g typescript
```
- Database: Install and configure a PostgreSQL database.
- AWS Account: An AWS account with access to S3, SQS, and SES services.
- AWS CLI: Install and configure the AWS CLI with your credentials.
- Environment Variables: You'll need to set various environment variables for configuration.


1. Clone the Repository
```
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```


2. Install Dependencies
```
npm install
```


3. Set Up Environment Variables
Create a .env file in the root directory of your project with the following variables:

```
# Application Settings
PORT=3000

# Database Configuration
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name

# AWS Configuration
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=your_aws_region (e.g., us-east-1)
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_SQS_QUEUE_URL=your_sqs_queue_url
AWS_SES_REGION=your_ses_region (usually same as AWS_REGION)

# SES Email Configuration
SES_SENDER_EMAIL=your_verified_ses_email@example.com
RECIPIENT_EMAILS=recipient1@example.com,recipient2@example.com
```
Note:
Replace placeholders with your actual configuration.
Ensure that the SES_SENDER_EMAIL and RECIPIENT_EMAILS are verified in AWS SES if you're in a sandbox environment.


4. Configure TypeORM
Update the ormconfig.json file or create one if it doesn't exist:

```
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "your_db_username",
  "password": "your_db_password",
  "database": "your_db_name",
  "entities": ["src/entities/**/*.ts"],
  "migrations": ["src/migrations/**/*.ts"],
  "cli": {
    "entitiesDir": "src/entities",
    "migrationsDir": "src/migrations"
  },
  "synchronize": true
}
```
Note: Set "synchronize": true for development purposes. For production, it's recommended to handle migrations manually.



5. Set Up AWS Services
- Amazon S3
    - Create an S3 bucket.
    - Update AWS_S3_BUCKET_NAME in your .env file with your bucket name.
    - Set proper permissions for the bucket to allow read/write operations.
- Amazon SQS
    - Create an SQS queue.
    - Update AWS_SQS_QUEUE_URL in your .env file with your queue URL.
- Amazon SES
    - Verify your sender and recipient emails in AWS SES.
    - Update SES_SENDER_EMAIL and RECIPIENT_EMAILS in your .env file.



6. Initialize the Database
Run migrations if you have any (optional):

```
npm run typeorm migration:run
```




7. Build the Project
Compile the TypeScript code:

```
npm run build
```




8. Start the Application
Start the server:

```
npm start
```
This will run the compiled JavaScript code from the dist directory.



9. Start the Worker
In a new terminal window, start the worker process:

```
node dist/workers/worker.js
```
Note: Ensure that the worker is running alongside the main application to process images from the SQS queue.



10. Verify AWS Services
Check your S3 bucket to see if the images and thumbnails are uploaded.
Monitor your SQS queue to ensure messages are being processed.
Verify that email notifications are sent via AWS SES.

<br>
<br>

## Docker Setup
If you prefer to run the project inside Docker, follow the steps below:

1. Build and Start Services
Docker Compose will automatically build and run both the app and a PostgreSQL database.

```
docker-compose up --build
```

This will:
Build the Node.js application image.
Set up a PostgreSQL database container.
2. Set Up Environment Variables
Ensure your .env file is properly configured with AWS and database details. Docker Compose will read these variables from the .env file.

3. Interact with the Application
The app will be accessible at http://localhost:3000.
The PostgreSQL database will be available at localhost:5432 inside the container.
4. Stop Services
To stop and remove containers, use:

```
docker-compose down
```
<br>
<br>

## How to run and test the application
10. Test the Application
- Use a tool like Postman or cURL to test the endpoints.
- Upload Image Endpoint:
```
POST http://localhost:3000/api/images
```
- Form Data:
    - Key: image (This should be the file input)
- Add Comment Endpoint:
```
POST http://localhost:3000/api/images/:imageId/comments
```
- JSON Body:
```
{
  "commentText": "Your comment here"
}
```