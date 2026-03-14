import User from '../models/User.js';
import Job from '../models/Job.js';
import QuickRequest from '../models/QuickRequest.js';
import Booking from '../models/Booking.js';

export const updateProfile = async (req, res) => {
    try {
        const { skills, availability, location, serviceType } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (skills !== undefined) user.skills = skills;
        if (availability !== undefined) user.availability = availability;
        if (location !== undefined) user.location = location;
        if (serviceType !== undefined) user.serviceType = serviceType;

        await user.save();

        res.json({
            message: 'Profile updated',
            worker: {
                id: user._id,
                name: user.name,
                skills: user.skills,
                availability: user.availability,
                location: user.location,
                serviceType: user.serviceType,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};

export const getWorkerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.serviceType) {
            return res.json({ quickRequests: [], activeJobs: [], directBookings: [] });
        }

        const quickRequests = await QuickRequest.find({
            service: { $regex: new RegExp(`^${user.serviceType}$`, 'i') }
        });

        const activeJobs = await Job.find({
            $or: [
                { assignedWorkerId: req.user.id },
                { 'applications.workerId': req.user.id }
            ]
        });

        const directBookings = await Booking.find({ workerId: req.user.id });

        res.json({ quickRequests, activeJobs, directBookings });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get dashboard', error: err.message });
    }
};

export const bookWorker = async (req, res) => {
    try {
        const { details, userContact } = req.body;
        if (!details || !userContact) {
            return res.status(400).json({ message: 'Booking details and contact number are required' });
        }

        const worker = await User.findOne({ _id: req.params.id, role: 'worker' });
        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        const booking = new Booking({
            workerId: worker._id,
            userId: req.user.id,
            workerName: worker.name,
            userName: req.user.name,
            userContact,
            details,
        });

        await booking.save();
        res.status(201).json({ message: 'Booking requested successfully', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to book worker', error: err.message });
    }
};

export const getWorkers = async (req, res) => {
    try {
        const { location, category } = req.query;
        const query = { role: 'worker' };

        if (location) query.location = { $regex: location, $options: 'i' };
        if (category) query.serviceType = { $regex: new RegExp(`^${category}$`, 'i') };

        const workers = await User.find(query).select('-passwordHash');
        res.json(workers);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get workers', error: err.message });
    }
};
