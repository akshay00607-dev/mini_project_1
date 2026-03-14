import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).select('name email role passwordHash');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

listUsers();
