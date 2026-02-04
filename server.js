import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import authRoutes from './routes/authRoute.js';
import notifRoutes from './routes/notificationRoute.js';
import hotelRoutes from './routes/hotelRoute.js';
import tripRoutes from './routes/tripRoute.js';
import tripHotelsRoutes from './routes/tripHotelsRoutes.js';
import tripItinerariesRoutes from './routes/tripItineraryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import responseRoutes from './routes/requestResponseRoutes.js';
import dashboardRoute from './routes/dashbordRoute.js';
// import { pool ,   testConnection} from './config/database.js';

// ============================
// CONFIG
// ============================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// SECURITY MIDDLEWARES
// ============================
app.use(helmet({ crossOriginResourcePolicy: false }));

const corsOptions = {
  origin: [
    'https://eclairtravel.com/',
    'https://www.eclairtravel.com/'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Trop de requêtes, réessayez plus tard'
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Trop de tentatives de connexion'
});
app.use('/api/auth', authLimiter);

// ============================
// LOGS
// ============================
app.use(morgan('combined'));
// ============================
// json
// ============================
app.use(express.json());
// ============================
// STATIC FILES
// ============================
app.use('/api/uploads', express.static('uploads'));

// ============================
// ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/notif', notifRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips', tripHotelsRoutes);
app.use('/api/trips', tripItinerariesRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/dashbord', dashboardRoute);

// app.get('/', (req, res) => {
//   res.json({ message: 'API sécurisée 🚀' });
// });

// app.get('/check-db', async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const db = await client.query('SELECT current_database()');
//     const tables = await client.query(
//       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
//     );
//     client.release();

//     res.json({
//       database: db.rows[0].current_database,
//       tables: tables.rows.map(t => t.table_name),
//       status: 'OK'
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Erreur DB' });
//   }
// });

// ============================
// ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
});

// ============================
// SERVER
// ============================
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur https://eclairtravel.com/`);
});


