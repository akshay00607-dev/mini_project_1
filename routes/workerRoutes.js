import express from 'express';
import { updateProfile, getWorkerDashboard, bookWorker, getWorkers } from '../controllers/workerController.js';
import { auth, requireRole } from '../verifyToken/auth.js';

const router = express.Router();

router.get('/services', getWorkers);
router.post('/profile', auth, requireRole('worker'), updateProfile);
router.get('/requests', auth, requireRole('worker'), getWorkerDashboard);
router.post('/:id/book', auth, requireRole('user'), bookWorker);

export default router;
