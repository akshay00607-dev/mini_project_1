import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerName: { type: String, required: true },
    userName: { type: String, required: true },
    userContact: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Cancelled', 'Completed'], default: 'Pending' },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
