import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bedrockModel: process.env.AWS_BEDROCK_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0',
    s3Bucket: process.env.S3_BUCKET_NAME,
  },
  geminiApiKey: process.env.GEMINI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default env;
