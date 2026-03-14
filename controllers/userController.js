import Job from '../models/Job.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getUserDashboard = async (req, res) => {
    try {
        const userJobs = await Job.find({ postedBy: req.user.id }).populate('applications.workerId', 'name email phone');
        const directBookings = await Booking.find({ userId: req.user.id });

        // Map applications to include worker details as expected by frontend
        const populatedJobs = userJobs.map(job => {
            const applications = job.applications.map(app => ({
                ...app.toObject(),
                workerName: app.workerId ? app.workerId.name : 'Unknown Worker',
                workerPhone: app.workerId ? app.workerId.phone : '',
                workerEmail: app.workerId ? app.workerId.email : '',
            }));
            return { ...job.toObject(), applications };
        });

        res.json({ postedJobs: populatedJobs, directBookings });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get dashboard', error: err.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, location, skills } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (location) user.location = location;
        if (skills !== undefined) user.skills = skills;

        await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location, skills: user.skills }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old password and new password are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
};
