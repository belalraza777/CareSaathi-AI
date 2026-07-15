import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoute.js';
import oauthRoutes from './routes/oauthRoute.js';
import profileRoutes from './routes/profileRoute.js';
import consultationRoutes from './routes/consultationRoute.js';
import { globalLimiter } from './middlewares/rateLimit.js';


//middleware
app.set('trust proxy', 1);  // trust first proxy (important for secure cookies in production)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(helmet());  // Set security-related HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(globalLimiter); //global rate limiter for all routes


//route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/readyz', (req, res) => {
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', oauthRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/consultation', consultationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS blocked for this origin' });
  }

  console.error(err);
  return res.status(err?.status || 500).json({
    success: false,
    message: err?.message || 'Internal server error',
  });
});

export default app;
