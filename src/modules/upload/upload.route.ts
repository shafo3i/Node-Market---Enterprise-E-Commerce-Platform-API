import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { isAdmin } from '../../middleware/auth-middleware';
import rateLimit from "express-rate-limit";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many upload requests from this IP, please try again after a while"
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload routes (admin only)
router.post('/', isAdmin, uploadLimiter, upload.single('file'), UploadController.uploadFile);
router.delete('/', isAdmin, UploadController.deleteFile);

export default router;
