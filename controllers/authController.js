import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../verifyToken/auth.js';

export const register = async (req, res) => {
    try {
        let { userId, name, email, phone, password, role, location, skills, availability, serviceType } = req.body;

        if (!userId || !name || !email || !password || !role) {
            return res.status(400).json({ message: 'User ID, name, email, password and role are required' });
        }

        email = email.toLowerCase().trim();
        userId = userId.toLowerCase().trim();

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const existingUserId = await User.findOne({ userId });
        if (existingUserId) {
            return res.status(409).json({ message: 'User ID is already taken. Please choose another one.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            userId,
            name,
            email,
            phone: phone || '',
            role,
            passwordHash,
            location: location || '',
            skills: skills || '',
            availability: availability || '',
            serviceType: serviceType || null,
        });

        await user.save();

        const token = generateToken(user);
        res.status(201).json({
            token,
            user: { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to register user', error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        let { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/User ID and password are required' });
        }

        identifier = identifier.toLowerCase().trim();

        const user = await User.findOne({
            $or: [{ email: identifier }, { userId: identifier }]
        });

        if (!user) {
            console.log(`Login failed: User not found for identifier ${identifier}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            console.log(`Login failed: Incorrect password for identifier ${identifier}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({
            token,
            user: { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to login', error: err.message });
    }
};
