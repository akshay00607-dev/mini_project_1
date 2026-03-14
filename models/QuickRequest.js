import mongoose from 'mongoose';

const quickRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    service: { type: String, required: true },
    details: { type: String, required: true },
}, { timestamps: true });

const QuickRequest = mongoose.model('QuickRequest', quickRequestSchema);
export default QuickRequest;
