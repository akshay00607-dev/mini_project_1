import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

async function migrateEmails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({});
        let updatedCount = 0;

        for (const user of users) {
            const lowerEmail = user.email.toLowerCase();
            if (user.email !== lowerEmail) {
                user.email = lowerEmail;
                await user.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete. Lowercased ${updatedCount} emails.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrateEmails();
