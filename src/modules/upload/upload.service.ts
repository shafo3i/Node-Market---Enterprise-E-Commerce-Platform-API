import sharp from 'sharp';
import path from 'path';
import { randomBytes } from 'crypto';
import { S3StorageService } from '../backup/s3-storage.service';
import { prisma } from '../../config/prisma';

interface UploadConfig {
  maxSizeMB?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface S3Settings {
  provider: 'wasabi' | 'amazon_s3';
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  endpoint?: string;
}

const DEFAULT_CONFIG: UploadConfig = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 85,
};

/**
 * Upload Service
 * Handles file validation, optimization, and S3 upload
 */
export const UploadService = {
  /**
   * Get S3 settings from database (BackupSettings)
   */
  getS3Settings: async (): Promise<S3Settings | null> => {
    try {
      const settings = await prisma.backupSettings.findFirst();

      if (
        !settings?.s3Provider ||
        !settings.s3AccessKey ||
        !settings.s3SecretKey ||
        !settings.s3Bucket ||
        !settings.s3Region
      ) {
        console.warn('⚠️ S3 storage not configured. Please configure S3 in backup settings.');
        return null;
      }

      return {
        provider: settings.s3Provider as 'wasabi' | 'amazon_s3',
        accessKey: settings.s3AccessKey,
        secretKey: settings.s3SecretKey,
        bucket: settings.s3Bucket,
        region: settings.s3Region,
        ...(settings.s3Endpoint && { endpoint: settings.s3Endpoint }),
      };
    } catch (error) {
      console.error('Failed to get S3 settings:', error);
      return null;
    }
  },

  /**
   * Validate file before upload
   */
  validateFile: (
    file: Express.Multer.File,
    config: UploadConfig = DEFAULT_CONFIG
  ): { valid: boolean; error?: string } => {
    // Check file size
    const maxSizeBytes = (config.maxSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${config.maxSizeMB}MB`,
      };
    }

    // Check file type
    const allowedTypes = config.allowedTypes || DEFAULT_CONFIG.allowedTypes!;
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  },

  /**
   * Optimize image using sharp
   */
  optimizeImage: async (
    buffer: Buffer,
    config: UploadConfig = DEFAULT_CONFIG
  ): Promise<Buffer> => {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if necessary
      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > (config.maxWidth || 2000) || metadata.height > (config.maxHeight || 2000))
      ) {
        image.resize(config.maxWidth || 2000, config.maxHeight || 2000, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to optimized format
      return await image
        .jpeg({ quality: config.quality || 85 })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Return original buffer if optimization fails
      return buffer;
    }
  },

  /**
   * Generate unique filename
   */
  generateFilename: (originalName: string, folder: string = 'uploads'): string => {
    const ext = path.extname(originalName).toLowerCase();
    const randomString = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${folder}/${timestamp}-${randomString}${ext}`;
  },

  /**
   * Upload file to S3 storage
   * @param file - Multer file object
   * @param folder - S3 folder (e.g., 'products', 'brands', 'categories')
   * @param config - Upload configuration
   */
  uploadToS3: async (
    file: Express.Multer.File,
    folder: string = 'uploads',
    config: UploadConfig = DEFAULT_CONFIG
  ): Promise<{ success: boolean; url?: string; key?: string; error?: string }> => {
    try {
      // Validate file
      const validation = UploadService.validateFile(file, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Validation failed',
        };
      }

      // Get S3 settings
      const s3Settings = await UploadService.getS3Settings();
      if (!s3Settings) {
        return {
          success: false,
          error: 'S3 storage not configured. Please go to Admin > Backups and configure S3 settings (Wasabi, Amazon S3, or UploadThing).',
        };
      }

      // Optimize image
      let buffer = file.buffer;
      if (file.mimetype.startsWith('image/')) {
        buffer = await UploadService.optimizeImage(buffer, config);
      }

      // Generate unique filename
      const key = UploadService.generateFilename(file.originalname, folder);

      // Upload to S3
      const result = await S3StorageService.uploadFile(
        buffer,
        key,
        file.mimetype,
        s3Settings
      );

      return result;
    } catch (error: any) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  },

  /**
   * Delete file from S3 storage
   */
  deleteFromS3: async (key: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const s3Settings = await UploadService.getS3Settings();
      if (!s3Settings) {
        return {
          success: false,
          error: 'S3 storage not configured',
        };
      }

      const result = await S3StorageService.deleteFile(key, s3Settings);
      return result;
    } catch (error: any) {
      console.error('Delete failed:', error);
      return {
        success: false,
        error: error.message || 'Delete failed',
      };
    }
  },
};
