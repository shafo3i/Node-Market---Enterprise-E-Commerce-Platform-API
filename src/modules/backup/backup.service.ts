import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../../config/prisma';
import fs from 'fs/promises';
import path from 'path';
import { sendEmail } from '../email/email.service';
import { S3StorageService } from './s3-storage.service';

const execAsync = promisify(exec);

// Backup directory: node-market/backups
const backupDir = path.join(process.cwd(), 'backups');
let cronJob: ReturnType<typeof cron.schedule> | null = null;

// Helper functions
const getCronExpression = (frequency: string, time: string): string => {
  const [hour, minute] = time.split(':').map(Number);

  switch (frequency) {
    case 'hourly':
      return `0 * * * *`;
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * 0`;
    case 'monthly':
      return `${minute} ${hour} 1 * *`;
    default:
      return `${minute} ${hour} * * *`;
  }
};

const updateNextBackupTime = async (settings: any) => {
  const now = new Date();
  const [hour, minute] = settings.time.split(':').map(Number);
  let nextBackup = new Date();
  nextBackup.setHours(hour, minute, 0, 0);

  if (nextBackup <= now) {
    switch (settings.frequency) {
      case 'hourly':
        nextBackup = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        nextBackup.setDate(nextBackup.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        nextBackup.setDate(1);
        break;
    }
  }

  await prisma.backupSettings.update({
    where: { id: settings.id },
    data: { nextBackupAt: nextBackup }
  });
};

const sendBackupNotification = async (
  success: boolean,
  filename: string,
  size: number,
  duration: number,
  error?: string
) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    });

    if (admins.length === 0) return;

    const subject = success
      ? '✅ Database Backup Successful'
      : '❌ Database Backup Failed';

    const body = success
      ? `
        <h2>Backup Completed Successfully</h2>
        <p><strong>Filename:</strong> ${filename}</p>
        <p><strong>Size:</strong> ${(size / 1024 / 1024).toFixed(2)} MB</p>
        <p><strong>Duration:</strong> ${(duration / 1000).toFixed(1)} seconds</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
      : `
        <h2>Backup Failed</h2>
        <p><strong>Filename:</strong> ${filename}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>Please check the backup configuration and try again.</p>
      `;

    for (const admin of admins) {
      await sendEmail(admin.email, subject, body);
    }
  } catch (error) {
    console.error('⚠️  Failed to send backup notification:', error);
  }
};

export const BackupService = {
  /**
   * Get backup settings (create default if not exists)
   */
  getSettings: async () => {
    let settings = await prisma.backupSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.backupSettings.create({
        data: {
          enabled: false,
          frequency: 'daily',
          time: '02:00',
          retentionDays: 30,
          backupLocation: 'local',
          emailNotification: true
        }
      });
    }
    
    return settings;
  },

  /**
   * Update backup settings and reschedule cron job
   */
  updateSettings: async (data: {
    enabled?: boolean;
    frequency?: string;
    time?: string;
    retentionDays?: number;
    backupLocation?: string;
    emailNotification?: boolean;
    s3Provider?: string | null;
    s3AccessKey?: string | null;
    s3SecretKey?: string | null;
    s3Bucket?: string | null;
    s3Region?: string | null;
    s3Endpoint?: string | null;
  }) => {
    const currentSettings = await BackupService.getSettings();
    
    const updatedSettings = await prisma.backupSettings.update({
      where: { id: currentSettings.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    await BackupService.scheduleBackup();
    
    return updatedSettings;
  },

  /**
   * Schedule automatic backups based on settings
   */
  scheduleBackup: async () => {
    const settings = await BackupService.getSettings();

    // Stop existing cron job
    if (cronJob) {
      cronJob.stop();
      cronJob = null;
      console.log('🔄 Stopped existing backup schedule');
    }

    if (!settings.enabled) {
      console.log('⏸️  Automatic backups are disabled');
      return;
    }

    const cronExpression = getCronExpression(settings.frequency, settings.time);

    cronJob = cron.schedule(cronExpression, async () => {
      console.log('⏰ Scheduled backup triggered');
      await BackupService.executeBackup();
    });

    console.log(`✅ Backup scheduled: ${settings.frequency} at ${settings.time} (${cronExpression})`);
    
    await updateNextBackupTime(settings);
  },

  /**
   * Execute database backup
   */
  executeBackup: async (): Promise<{ success: boolean; filename?: string; error?: string }> => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `backup_${timestamp}.sql`;
    const backupPath = path.join(backupDir, filename);

    console.log('🔄 Starting database backup...');

    try {
      await fs.mkdir(backupDir, { recursive: true });

      const dbHost = process.env.DATABASE_HOST || '192.168.1.3';
      const dbPort = process.env.DATABASE_PORT || '3201';
      const dbUser = process.env.DATABASE_USER || 'postgres';
      const dbName = process.env.DATABASE_NAME || 'node_market';
      const dbPassword = process.env.DATABASE_PASSWORD || '';
      const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';
      
      const command = `${pgDumpPath} -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${backupPath}"`;
      const env = { ...process.env, PGPASSWORD: dbPassword };

      await execAsync(command, { env, maxBuffer: 1024 * 1024 * 50 });

      const stats = await fs.stat(backupPath);

      console.log('📦 Compressing backup...');
      await execAsync(`gzip -f "${backupPath}"`);
      
      const gzFilename = `${filename}.gz`;
      const gzStats = await fs.stat(`${backupPath}.gz`);
      const duration = Date.now() - startTime;

      console.log(`✅ Backup completed: ${gzFilename} (${(gzStats.size / 1024 / 1024).toFixed(2)} MB) in ${(duration / 1000).toFixed(1)}s`);

      const settings = await BackupService.getSettings();
      let s3Key: string | null = null;
      let location = 'local';

      // Upload to S3 if configured
      if (settings.s3Provider && settings.s3AccessKey && settings.s3SecretKey && settings.s3Bucket && settings.s3Region) {
        console.log(`☁️  Uploading backup to ${settings.s3Provider}...`);
        
        const uploadResult = await S3StorageService.uploadBackup(
          `${backupPath}.gz`,
          {
            provider: settings.s3Provider as 'wasabi' | 'amazon_s3',
            accessKey: settings.s3AccessKey,
            secretKey: settings.s3SecretKey,
            bucket: settings.s3Bucket,
            region: settings.s3Region,
            endpoint: settings.s3Endpoint || undefined,
          }
        );

        if (uploadResult.success) {
          console.log(`✅ Backup uploaded to ${settings.s3Provider}`);
          s3Key = uploadResult.key || null;
          location = settings.s3Provider;
        } else {
          console.error(`⚠️  S3 upload failed: ${uploadResult.error}`);
        }
      }

      await prisma.backupHistory.create({
        data: {
          filename: gzFilename,
          size: gzStats.size,
          status: 'SUCCESS',
          duration,
          location,
          s3Key
        }
      });

      await prisma.backupSettings.updateMany({
        data: { lastBackupAt: new Date() }
      });

      await BackupService.cleanOldBackups();

      if (settings.emailNotification) {
        await sendBackupNotification(true, gzFilename, gzStats.size, duration);
      }

      return { success: true, filename: gzFilename };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';

      console.error('❌ Backup failed:', errorMessage);

      await prisma.backupHistory.create({
        data: {
          filename,
          size: 0,
          status: 'FAILED',
          error: errorMessage,
          duration,
          location: 'local'
        }
      });

      const settings = await BackupService.getSettings();
      if (settings.emailNotification) {
        await sendBackupNotification(false, filename, 0, duration, errorMessage);
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Clean old backups based on retention policy
   */
  cleanOldBackups: async () => {
    try {
      const settings = await BackupService.getSettings();
      const files = await fs.readdir(backupDir);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

      let deletedCount = 0;

      for (const file of files) {
        if (!file.startsWith('backup_')) continue;

        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Cleaned ${deletedCount} old backup(s)`);
      }
    } catch (error) {
      console.error('⚠️  Failed to clean old backups:', error);
    }
  },

  /**
   * Trigger manual backup
   */
  triggerManualBackup: async () => {
    console.log('🔧 Manual backup triggered');
    return await BackupService.executeBackup();
  },

  /**
   * Get backup history
   */
  getHistory: async (limit = 50) => {
    return await prisma.backupHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  },

  /**
   * Get backup statistics
   */
  getStatistics: async () => {
    const [totalBackups, successfulBackups, failedBackups, settings] = await Promise.all([
      prisma.backupHistory.count(),
      prisma.backupHistory.count({ where: { status: 'SUCCESS' } }),
      prisma.backupHistory.count({ where: { status: 'FAILED' } }),
      BackupService.getSettings()
    ]);

    const successfulHistory = await prisma.backupHistory.findMany({
      where: { status: 'SUCCESS' },
      select: { size: true }
    });

    const totalSize = successfulHistory.reduce((sum, backup) => sum + backup.size, 0);

    let filesInDirectory = 0;
    try {
      const files = await fs.readdir(backupDir);
      filesInDirectory = files.filter(f => f.startsWith('backup_')).length;
    } catch (error) {
      filesInDirectory = 0;
    }

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      filesInDirectory,
      lastBackupAt: settings.lastBackupAt,
      nextBackupAt: settings.nextBackupAt,
      retentionDays: settings.retentionDays
    };
  },

  /**
   * Delete a specific backup file
   */
  deleteBackup: async (filename: string) => {
    try {
      const filePath = path.join(backupDir, filename);
      await fs.unlink(filePath);
      
      await prisma.backupHistory.deleteMany({
        where: { filename }
      });

      console.log(`🗑️  Deleted backup: ${filename}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to delete backup:', error);
      return { success: false, error: error.message };
    }
  }
};
