import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'admin@example.com';
        const password = 'adminpassword123';

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists.');
            await mongoose.connection.close();
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const admin = new User({
            name: 'System Admin',
            email: email,
            passwordHash: passwordHash,
            role: 'admin',
            phone: '0000000000',
            location: 'System',
        });

        await admin.save();
        console.log(`Admin created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

createAdmin();
