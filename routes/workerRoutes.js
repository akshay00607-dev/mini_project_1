import express from 'express';
import { updateProfile, getWorkerDashboard, bookWorker, getWorkers, updateBookingStatus } from '../controllers/workerController.js';
import { auth, requireRole } from '../verifyToken/auth.js';

const router = express.Router();

router.get('/services', getWorkers);
router.post('/profile', auth, requireRole('worker'), updateProfile);
router.get('/requests', auth, requireRole('worker'), getWorkerDashboard);
router.post('/:id/book', auth, requireRole('user'), bookWorker);
router.put('/booking/:id/status', auth, requireRole('worker'), updateBookingStatus);

export default router;
