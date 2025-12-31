import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response, NextFunction } from "express";
import { s3Client } from "../../utils/s3Client";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";

/**
 * Generate a pre-signed URL for uploading a file to S3
 */
export const getSignedUrlController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      throw createHttpError(400, "fileName and fileType are required");
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
      throw createHttpError(500, "AWS_BUCKET_NAME is not configured");
    }

    // Generate a unique key for the file
    // Structure: uploads/{date}/{uuid}-{filename}
    const date = new Date().toISOString().split("T")[0];
    const uniqueId = uuidv4();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${date}/${uniqueId}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      // ACL: "public-read", // Optional: depending on bucket settings
    });

    // Generate signed URL valid for 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.json({
      signedUrl,
      key,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    next(error);
  }
};
