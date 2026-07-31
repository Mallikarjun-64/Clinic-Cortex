import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import Route Handlers
import authRouter from './routes/auth.routes.js';
import doctorRouter from './routes/doctor.routes.js';
import patientRouter from './routes/patient.routes.js';
import appointmentRouter from './routes/appointment.routes.js';
import consultationRouter from './routes/consultation.routes.js';
import scheduleRouter from './routes/schedule.routes.js';
import messageRouter from './routes/message.routes.js';
import notificationRouter from './routes/notification.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

// Import Patient Route Handlers
import patientAuthRouter from './routes/patientAuth.routes.js';
import pharmacyRouter from './routes/pharmacy.routes.js';
import walletRouter from './routes/wallet.routes.js';
import aiAnalyzerRouter from './routes/aiAnalyzer.routes.js';

import { query } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// CORS Configuration supporting multiple frontends (Doctor, Patient)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim().toLowerCase());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    const lowerOrigin = origin.toLowerCase();
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(lowerOrigin);

    if (allowedOrigins.includes('*') || allowedOrigins.indexOf(lowerOrigin) !== -1 || isLocalhost) {
      callback(null, true);
    } else {
      console.warn(`Origin blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Mount routes under /api
app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/consultations', consultationRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/messages', messageRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/dashboard', dashboardRouter);

// Patient-facing endpoints
app.use('/api/patient-auth', patientAuthRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/ai-analyzer', aiAnalyzerRouter);

// Public doctors directory endpoint for patient portal
app.get('/api/doctors-directory', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, salutation, first_name, middle_name, last_name, profile_photo_url,
              professional_email, mobile, clinic_address, smc_name, pg_specialization,
              experience_years, clinic_fee, online_fee, consult_languages, bio
       FROM doctors ORDER BY first_name ASC`
    );
    res.status(200).json({ success: true, count: result.rows.length, doctors: result.rows });
  } catch (err) {
    console.error('Fetch Public Doctors Error:', err);
    res.status(500).json({ success: false, message: 'Server error listing doctors' });
  }
});

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running normally' });
});


// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`ClinicCortex backend server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
