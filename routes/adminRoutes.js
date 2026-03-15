import express from 'express';
import { getOverview, getUsers, deleteUser, deleteJob, getJobs, getQuickRequests, deleteQuickRequest, getContacts, deleteContact } from '../controllers/adminController.js';
import { auth, requireRole } from '../verifyToken/auth.js';

const router = express.Router();

router.use(auth, requireRole('admin'));

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getJobs);
router.delete('/jobs/:id', deleteJob);
router.get('/quick-requests', getQuickRequests);
router.delete('/quick-requests/:id', deleteQuickRequest);
router.get('/contact', getContacts);
router.delete('/contact/:id', deleteContact);

export default router;
