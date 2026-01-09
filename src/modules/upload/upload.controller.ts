import { Request, Response } from 'express';
import { UploadService } from './upload.service';
import { auth } from '../../auth';
import { fromNodeHeaders } from 'better-auth/node';

export class UploadController {
  /**
   * Upload file to S3 storage
   * POST /api/upload
   */
  static async uploadFile(req: Request, res: Response) {
    try {
      // Check authentication
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Check if user is admin
      if (session.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'User not authorized' });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // Get folder from request (default to 'uploads')
      const folder = req.body.folder || 'uploads';

      // Validate folder name (prevent path traversal)
      const allowedFolders = ['products', 'brands', 'categories', 'uploads'];
      if (!allowedFolders.includes(folder)) {
        return res.status(400).json({
          success: false,
          error: `Invalid folder. Allowed: ${allowedFolders.join(', ')}`,
        });
      }

      // Upload to S3
      const result = await UploadService.uploadToS3(req.file, folder);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.status(200).json({
        success: true,
        url: result.url,
        key: result.key,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message || 'Upload failed',
      });
    }
  }

  /**
   * Delete file from S3 storage
   * DELETE /api/upload
   */
  static async deleteFile(req: Request, res: Response) {
    try {
      // Check authentication
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Check if user is admin
      if (session.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'User not authorized' });
      }

      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ success: false, error: 'File key is required' });
      }

      const result = await UploadService.deleteFromS3(key);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message || 'Delete failed',
      });
    }
  }
}
