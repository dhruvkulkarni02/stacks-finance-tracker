// server/src/routes/users.ts
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;