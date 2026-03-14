import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function checkAdmins() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admins = await User.find({ role: 'admin' });
        console.log(JSON.stringify(admins, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkAdmins();
