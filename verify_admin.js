import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.log('Admin user not found. Creating one...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      admin = new User({
        userId: 'admin_dashboard_user',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'admin',
        passwordHash
      });
      await admin.save();
      console.log('Admin user created successfully.');
    } else {
        // Just enforce the password is correct for testing
        const passwordHash = await bcrypt.hash('admin123', 10);
        admin.passwordHash = passwordHash;
        admin.userId = admin.userId || 'admin_dashboard_user'; // Ensure userId exists
        await admin.save();
        console.log('Admin user exists. Password updated to admin123.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

verifyAdmin();
