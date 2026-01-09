import { Router } from 'express';
import { BackupController } from './backup.controller';
import { isAdmin } from '../../middleware/auth-middleware';

const router = Router();

// All backup routes require admin authentication


// Get backup settings
router.get('/settings', isAdmin, BackupController.getSettings);

// Update backup settings
router.put('/settings', isAdmin, BackupController.updateSettings);

// Trigger manual backup
router.post('/trigger', isAdmin, BackupController.triggerBackup);

// Get backup history
router.get('/history', isAdmin, BackupController.getHistory);

// Get backup statistics
router.get('/statistics', isAdmin, BackupController.getStatistics);

// Test S3 connection
router.post('/test-s3', isAdmin, BackupController.testS3Connection);

// Delete specific backup
router.delete('/:filename', isAdmin, BackupController.deleteBackup);

export default router;
