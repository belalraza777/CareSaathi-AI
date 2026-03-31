import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoute.js';
import oauthRoutes from './routes/oauthRoute.js';
import profileRoutes from './routes/profileRoute.js';
import consultationRoutes from './routes/consultationRoute.js';


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', oauthRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/consultation', consultationRoutes);

export default app;
