import Job from '../models/Job.js';

export const createJob = async (req, res) => {
    try {
        const { title, location, category, pay, hours, description, date } = req.body;

        if (!title || !location || !pay || !hours || !description) {
            return res.status(400).json({ message: 'Missing required job fields' });
        }

        const job = new Job({
            title,
            location,
            category: category || 'general',
            pay,
            hours,
            description,
            date: date || null,
            postedBy: req.user.id,
        });

        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create job', error: err.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const { location, category, status } = req.query;

        const query = {};
        if (location) query.location = { $regex: location, $options: 'i' };
        if (category) query.category = category;
        if (status) query.status = status;

        const jobs = await Job.find(query).populate('postedBy', 'name email');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get jobs', error: err.message });
    }
};

export const applyForJob = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid job ID' });
        }
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot apply for your own job' });
        }

        const alreadyApplied = job.applications.some(a => a.workerId.toString() === req.user.id);
        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        job.applications.push({ workerId: req.user.id, status: 'Requested' });
        if (job.status === 'Open') {
            job.status = 'Requested';
        }

        await job.save();
        res.json({ message: 'Applied for job', job });
    } catch (err) {
        res.status(500).json({ message: 'Failed to apply for job', error: err.message });
    }
};

export const selectWorker = async (req, res) => {
    try {
        const { workerId } = req.body;
        if (!workerId) return res.status(400).json({ message: 'workerId is required' });

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only the job poster or admin can select a worker' });
        }

        const application = job.applications.find(a => a.workerId.toString() === workerId);
        if (!application) {
            return res.status(400).json({ message: 'Worker has not applied for this job' });
        }

        application.status = 'Accepted';
        job.assignedWorkerId = workerId;
        job.status = 'Accepted';

        await job.save();
        res.json({ message: 'Worker selected for job', job });
    } catch (err) {
        res.status(500).json({ message: 'Failed to select worker', error: err.message });
    }
};

export const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['Open', 'Requested', 'Accepted', 'InProgress', 'Completed', 'Cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const isPoster = job.postedBy.toString() === req.user.id;
        const isAssignedWorker = job.assignedWorkerId && job.assignedWorkerId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isPoster && !isAssignedWorker && !isAdmin) {
            return res.status(403).json({ message: 'Not allowed to update this job' });
        }

        job.status = status;
        await job.save();
        res.json({ message: 'Job status updated', job });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update job status', error: err.message });
    }
};
