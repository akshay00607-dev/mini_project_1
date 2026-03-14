import express from 'express';
import { createJob, getJobs, applyForJob, selectWorker, updateJobStatus } from '../controllers/jobController.js';
import { auth, requireRole } from '../verifyToken/auth.js';

const router = express.Router();

router.get('/', getJobs);
router.post('/', auth, requireRole('user', 'admin'), createJob);
router.post('/:id/apply', auth, requireRole('worker', 'jobSeeker', 'user'), applyForJob);
router.post('/:id/select-worker', auth, selectWorker);
router.patch('/:id/status', auth, updateJobStatus);

export default router;
