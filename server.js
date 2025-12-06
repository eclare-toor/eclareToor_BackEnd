import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/authRoute.js';
import notifRoutes from './routes/notificationRoute.js';
import hotelRoutes from "./routes/hotelRoute.js";
import tripRoutes from "./routes/tripRoute.js";
import tripHotelsRoutes from "./routes/tripHotelsRoutes.js";
import tripItinerariesRoutes from "./routes/tripItineraryRoutes.js";
import { testConnection } from './config/database.js';
// a supp apres
import { pool } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Morgan pour le logging des requêtes
app.use(morgan('dev')); 
app.use(express.json());
app.use(cors());
// To serve images
app.use("/api/uploads", express.static("uploads"));

// Routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips", tripHotelsRoutes);
app.use("/api/trips", tripItinerariesRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notif', notifRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Auth JWT 🚀' });
});

// Route pour vérifier la DB
app.get('/check-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const db = await client.query('SELECT current_database()');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    client.release();
    
    res.json({
      database: db.rows[0].current_database,
      tables: tables.rows.map(t => t.table_name),
      status: 'OK'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
   testConnection();
});