import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { isAdmin } from '../../middleware/auth-middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload routes (admin only)
router.post('/', isAdmin, upload.single('file'), UploadController.uploadFile);
router.delete('/', isAdmin, UploadController.deleteFile);

export default router;
