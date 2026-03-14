import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'worker', 'jobSeeker', 'admin'], required: true },
    location: { type: String, default: '' },
    skills: { type: String, default: '' },
    availability: { type: String, default: '' },
    serviceType: { type: String, default: null },
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
