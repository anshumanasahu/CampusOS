import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import env from '../config/env.js';
import AppError from '../utils/app-error.js';

const s3Client = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKey,
    secretAccessKey: env.aws.secretKey,
  },
});

/**
 * Upload a file buffer to S3.
 * @param {Buffer} buffer - File content
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @returns {string} The S3 key
 */
export const uploadToS3 = async (buffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: env.aws.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('S3 upload error:', error.message);
    throw new AppError('File upload failed', 502, 'STORAGE_ERROR');
  }
};

/**
 * Delete a file from S3.
 * Non-critical — logs error but does not throw.
 */
export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: env.aws.s3Bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error.message);
  }
};

/**
 * Get a signed URL for private file access (1 hour expiry).
 */
export const getSignedFileUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: env.aws.s3Bucket,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('S3 signed URL error:', error.message);
    throw new AppError('Failed to generate file access URL', 502, 'STORAGE_ERROR');
  }
};

/**
 * Get file content from S3 as Buffer.
 */
export const getFileFromS3 = async (key) => {
  const command = new GetObjectCommand({
    Bucket: env.aws.s3Bucket,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('S3 get file error:', error.message);
    throw new AppError('Failed to retrieve file', 502, 'STORAGE_ERROR');
  }
};

/**
 * Generate a unique S3 key for a user file.
 */
export const generateFileKey = (userId, folder, originalName) => {
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${folder}/${timestamp}-${safeName}`;
};
