import 'dotenv/config';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import miscRoutes from './routes/miscRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json());


// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker', workerRoutes); // Support both plural and singular
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);

// Direct mount for services as used in script.js (fetch(`${API_BASE}/services`))
import { getWorkers } from './controllers/workerController.js';
app.get('/api/services', getWorkers);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
