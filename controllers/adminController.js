import User from '../models/User.js';
import Job from '../models/Job.js';
import QuickRequest from '../models/QuickRequest.js';
import Contact from '../models/Contact.js';
import Rating from '../models/Rating.js';
import Booking from '../models/Booking.js';

export const getOverview = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const jobsCount = await Job.countDocuments();
        const ratingsCount = await Rating.countDocuments();
        const serviceCategories = ['plumber', 'electrician', 'cleaning', 'carpenter', 'ac-repair', 'pest-control'];

        res.json({ usersCount, jobsCount, ratingsCount, serviceCategories });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get overview', error: err.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin user' });

        // Cascade deletions to prevent "ghost" data on dashboards
        await Job.deleteMany({ postedBy: req.params.id });
        await Job.updateMany(
            { 'applications.workerId': req.params.id },
            { $pull: { applications: { workerId: req.params.id } } }
        );
        await Booking.deleteMany({
            $or: [{ userId: req.params.id }, { workerId: req.params.id }]
        });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete job', error: err.message });
    }
};

export const getQuickRequests = async (req, res) => {
    try {
        const requests = await QuickRequest.find();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get quick requests', error: err.message });
    }
};

export const deleteQuickRequest = async (req, res) => {
    try {
        await QuickRequest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete request', error: err.message });
    }
};

export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get contacts', error: err.message });
    }
};

export const deleteContact = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete message', error: err.message });
    }
};
