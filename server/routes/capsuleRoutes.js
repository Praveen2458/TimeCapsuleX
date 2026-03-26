import { Router } from 'express';
import multer from 'multer';
import {
  createCapsule,
  getCapsule,
  unlockCapsuleWithPassword,
  getMyCapsules,
  deleteCapsule
} from '../controllers/capsuleController.js';
import { authRequired } from '../middleware/authMiddleware.js';
import {
  createCapsuleRateLimiter,
  viewCapsuleRateLimiter
} from '../middleware/rateLimiter.js';

const router = Router();

// For now, store file in memory; integration with Cloudinary can be added later
const upload = multer({ storage: multer.memoryStorage() });

// Capsule creation requires authentication so only logged-in users can create capsules
router.post('/', createCapsuleRateLimiter, authRequired, upload.single('media'), createCapsule);
router.get('/my', authRequired, getMyCapsules);
router.get('/:slug', viewCapsuleRateLimiter, getCapsule);
router.post('/:slug/unlock', viewCapsuleRateLimiter, unlockCapsuleWithPassword);
router.delete('/:slug', authRequired, deleteCapsule);

export default router;
