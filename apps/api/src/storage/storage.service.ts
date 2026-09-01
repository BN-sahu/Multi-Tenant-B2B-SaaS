import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'helpdesk-attachments';
  }

  async generateUploadUrl(tenantId: string, ticketId: string, filename: string, mimeType: string) {
    const objectKey = `tenants/${tenantId}/tickets/${ticketId}/${uuidv4()}/${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { url, key: objectKey };
  }

  async generateDownloadUrl(objectKey: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
