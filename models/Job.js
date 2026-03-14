import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'general' },
    pay: { type: String, required: true },
    hours: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, default: null },
    status: { type: String, enum: ['Open', 'Requested', 'Accepted', 'InProgress', 'Completed', 'Cancelled'], default: 'Open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applications: [{
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: 'Requested' }
    }],
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
