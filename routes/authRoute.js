import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken , requireAnyRole} from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/profile', authenticateToken, authController.getProfile);
router.delete('/', authenticateToken, requireAnyRole(["admin"]) ,authController.deleteManyUsers);

export default router;