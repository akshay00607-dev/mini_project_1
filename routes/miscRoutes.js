import express from 'express';
import QuickRequest from '../models/QuickRequest.js';
import Contact from '../models/Contact.js';
import Rating from '../models/Rating.js';
import Job from '../models/Job.js';
import { auth } from '../verifyToken/auth.js';

const router = express.Router();

router.post('/quick-requests', async (req, res) => {
    try {
        const { name, contact, service, details } = req.body;
        if (!name || !contact || !service || !details) {
            return res.status(400).json({ message: 'name, contact, service and details are required' });
        }
        const qr = new QuickRequest({ name, contact, service, details });
        await qr.save();
        res.status(201).json(qr);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create quick request', error: err.message });
    }
});

router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required' });
        }
        const contactMsg = new Contact({ name, email, message });
        await contactMsg.save();
        res.status(201).json(contactMsg);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

router.post('/ratings', auth, async (req, res) => {
    try {
        const { jobId, toUserId, rating, comment } = req.body;

        if (!jobId || !toUserId || !rating) {
            return res.status(400).json({ message: 'jobId, toUserId and rating are required' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.status !== 'Completed') {
            return res.status(400).json({ message: 'Ratings are allowed only after job completion' });
        }

        const allowedRaters = [job.postedBy.toString(), job.assignedWorkerId && job.assignedWorkerId.toString()];
        if (!allowedRaters.includes(req.user.id)) {
            return res.status(403).json({ message: 'You are not allowed to rate this job' });
        }

        const ratingObj = new Rating({
            jobId,
            fromUserId: req.user.id,
            toUserId,
            rating,
            comment: comment || '',
        });

        await ratingObj.save();
        res.status(201).json(ratingObj);
    } catch (err) {
        res.status(500).json({ message: 'Failed to post rating', error: err.message });
    }
});

export default router;
