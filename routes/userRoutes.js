import express from 'express';
import { getUserDashboard, updateUserProfile, changePassword } from '../controllers/userController.js';
import { auth, requireRole } from '../verifyToken/auth.js';

const router = express.Router();

router.get('/dashboard', auth, requireRole('user'), getUserDashboard);
router.put('/profile', auth, updateUserProfile);
router.post('/change-password', auth, changePassword);

export default router;
