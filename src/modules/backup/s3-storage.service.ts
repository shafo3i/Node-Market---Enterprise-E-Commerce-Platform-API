import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

interface S3Config {
  provider: 'wasabi' | 'amazon_s3';
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  endpoint?: string | undefined;
}

// S3 Provider endpoints
const getS3Endpoint = (provider: string, region: string): string | undefined => {
  switch (provider) {
    case 'wasabi':
      // Wasabi endpoints by region
      return `https://s3.${region}.wasabisys.com`;
    case 'amazon_s3':
      // Amazon S3 uses default endpoint based on region
      return undefined;
    default:
      return undefined;
  }
};

/**
 * S3 Storage Service
 * Handles upload/delete operations for Wasabi, Amazon S3, and UploadThing
 * Supports both backup files and general file uploads (images, documents, etc.)
 */
export const S3StorageService = {
  /**
   * Create S3 client based on provider configuration
   */
  createClient: (config: S3Config): S3Client => {
    const endpoint = config.endpoint || getS3Endpoint(config.provider, config.region);

    const clientConfig: any = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: config.provider === 'wasabi', // Wasabi requires path-style
    };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    return new S3Client(clientConfig);
  },

  /**
   * Upload backup file to S3-compatible storage
   */
  uploadBackup: async (
    filePath: string,
    config: S3Config
  ): Promise<{ success: boolean; key?: string; error?: string }> => {
    try {
      const fileName = path.basename(filePath);
      const fileContent = await fs.readFile(filePath);
      const s3Key = `backups/${fileName}`;

      const client = S3StorageService.createClient(config);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/gzip',
        ServerSideEncryption: 'AES256', // Enable encryption at rest
        Metadata: {
          'backup-date': new Date().toISOString(),
          'provider': config.provider,
        },
      });

      await client.send(command);

      console.log(`✅ Backup uploaded to ${config.provider}: ${s3Key}`);

      return {
        success: true,
        key: s3Key,
      };
    } catch (error: any) {
      console.error(`❌ Failed to upload backup to ${config.provider}:`, error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  },

  /**
   * Delete backup file from S3-compatible storage
   */
  deleteBackup: async (
    s3Key: string,
    config: S3Config
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = S3StorageService.createClient(config);

      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: s3Key,
      });

      await client.send(command);

      console.log(`🗑️  Backup deleted from ${config.provider}: ${s3Key}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Failed to delete backup from ${config.provider}:`, error);
      return {
        success: false,
        error: error.message || 'Delete failed',
      };
    }
  },

  /**
   * List all backups in S3-compatible storage
   */
  listBackups: async (config: S3Config): Promise<{ files: string[]; error?: string }> => {
    try {
      const client = S3StorageService.createClient(config);

      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: 'backups/',
      });

      const response = await client.send(command);

      const files = response.Contents?.map((item) => item.Key || '') || [];

      return {
        files,
      };
    } catch (error: any) {
      console.error(`❌ Failed to list backups from ${config.provider}:`, error);
      return {
        files: [],
        error: error.message || 'List failed',
      };
    }
  },

  /**
   * Test S3 connection with provided credentials
   */
  testConnection: async (config: S3Config): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = S3StorageService.createClient(config);

      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        MaxKeys: 1,
      });

      await client.send(command);

      console.log(`✅ Successfully connected to ${config.provider}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Failed to connect to ${config.provider}:`, error);
      return {
        success: false,
        error: error.message || 'Connection test failed',
      };
    }
  },

  /**
   * Upload a file to S3 storage (generic method for any file type)
   * @param buffer - File buffer
   * @param key - S3 object key (path/filename)
   * @param contentType - MIME type of the file
   * @param config - S3 configuration
   */
  uploadFile: async (
    buffer: Buffer,
    key: string,
    contentType: string,
    config: S3Config
  ): Promise<{ success: boolean; url?: string; key?: string; error?: string }> => {
    try {
      const client = S3StorageService.createClient(config);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);

      // Generate public URL based on provider
      let url = '';
      if (config.provider === 'wasabi') {
        url = `https://s3.${config.region}.wasabisys.com/${config.bucket}/${key}`;
      } else if (config.provider === 'amazon_s3') {
        url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
      } else if (config.provider === 'uploadthing') {
        url = `https://uploadthing.com/${config.bucket}/${key}`;
      }

      console.log(`✅ File uploaded successfully to ${config.provider}: ${key}`);

      return {
        success: true,
        url,
        key,
      };
    } catch (error: any) {
      console.error(`❌ Failed to upload file to ${config.provider}:`, error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  },

  /**
   * Delete a file from S3 storage (generic method)
   * @param key - S3 object key to delete
   * @param config - S3 configuration
   */
  deleteFile: async (
    key: string,
    config: S3Config
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = S3StorageService.createClient(config);

      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      await client.send(command);

      console.log(`✅ File deleted successfully from ${config.provider}: ${key}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Failed to delete file from ${config.provider}:`, error);
      return {
        success: false,
        error: error.message || 'Delete failed',
      };
    }
  },
};
