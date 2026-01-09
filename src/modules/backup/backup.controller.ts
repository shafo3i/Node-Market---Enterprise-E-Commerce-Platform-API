import { Request, Response } from 'express';
import { BackupService } from './backup.service';
import { S3StorageService } from './s3-storage.service';


export class BackupController {
  /**
   * GET /api/admin/backup/settings
   * Get backup settings
   */
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await BackupService.getSettings();
      res.json(settings);
    } catch (error: any) {
      console.error('Failed to fetch backup settings:', error);
      res.status(500).json({ error: 'Failed to fetch backup settings' });
    }
  }

  /**
   * PUT /api/admin/backup/settings
   * Update backup settings
   */
  static async updateSettings(req: Request, res: Response) {
    try {
      const { 
        enabled, 
        frequency, 
        time, 
        retentionDays, 
        backupLocation, 
        emailNotification,
        s3Provider,
        s3AccessKey,
        s3SecretKey,
        s3Bucket,
        s3Region,
        s3Endpoint
      } = req.body;

      const settings = await BackupService.updateSettings({
        enabled,
        frequency,
        time,
        retentionDays,
        backupLocation,
        emailNotification,
        s3Provider,
        s3AccessKey,
        s3SecretKey,
        s3Bucket,
        s3Region,
        s3Endpoint
      });

      res.json({
        message: 'Backup settings updated successfully',
        settings
      });
    } catch (error: any) {
      console.error('Failed to update backup settings:', error);
      res.status(500).json({ error: 'Failed to update backup settings' });
    }
  }

  /**
   * POST /api/admin/backup/trigger
   * Trigger manual backup
   */
  static async triggerBackup(req: Request, res: Response) {
    try {
      const result = await BackupService.triggerManualBackup();

      if (result.success) {
        res.json({
          message: 'Backup completed successfully',
          filename: result.filename
        });
      } else {
        res.status(500).json({
          error: 'Backup failed',
          details: result.error
        });
      }
    } catch (error: any) {
      console.error('Failed to trigger backup:', error);
      res.status(500).json({ error: 'Failed to trigger backup' });
    }
  }

  /**
   * GET /api/admin/backup/history
   * Get backup history
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await BackupService.getHistory(limit);
      
      res.json(history);
    } catch (error: any) {
      console.error('Failed to fetch backup history:', error);
      res.status(500).json({ error: 'Failed to fetch backup history' });
    }
  }

  /**
   * GET /api/admin/backup/statistics
   * Get backup statistics
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      const stats = await BackupService.getStatistics();
      res.json(stats);
    } catch (error: any) {
      console.error('Failed to fetch backup statistics:', error);
      res.status(500).json({ error: 'Failed to fetch backup statistics' });
    }
  }

  /**
   * DELETE /api/admin/backup/:filename
   * Delete a specific backup
   */
  static async deleteBackup(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const result = await BackupService.deleteBackup(filename);

      if (result.success) {
        res.json({ message: 'Backup deleted successfully' });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error: any) {
      console.error('Failed to delete backup:', error);
      res.status(500).json({ error: 'Failed to delete backup' });
    }
  }

  /**
   * POST /api/admin/backup/test-s3
   * Test S3 connection
   */
  static async testS3Connection(req: Request, res: Response) {
    try {
      const { s3Provider, s3AccessKey, s3SecretKey, s3Bucket, s3Region, s3Endpoint } = req.body;

      if (!s3Provider || !s3AccessKey || !s3SecretKey || !s3Bucket || !s3Region) {
        return res.status(400).json({ 
          error: 'Missing required S3 configuration fields' 
        });
      }

      const result = await S3StorageService.testConnection({
        provider: s3Provider,
        accessKey: s3AccessKey,
        secretKey: s3SecretKey,
        bucket: s3Bucket,
        region: s3Region,
        endpoint: s3Endpoint
      });

      if (result.success) {
        res.json({ message: 'S3 connection successful', success: true });
      } else {
        res.status(400).json({ error: result.error, success: false });
      }
    } catch (error: any) {
      console.error('Failed to test S3 connection:', error);
      res.status(500).json({ error: 'Failed to test S3 connection' });
    }
  }
}
