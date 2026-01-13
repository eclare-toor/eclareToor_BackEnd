import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken , requireAnyRole , checkUserActive} from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/profile', authenticateToken, checkUserActive ,authController.getProfile);
router.delete('/', authenticateToken, requireAnyRole(["admin"]) ,authController.deleteManyUsers);
router.get('/users', authenticateToken, requireAnyRole(["admin"]) ,authController.getAllUsers);
router.post('/activate', authenticateToken, requireAnyRole(["admin"]) ,authController.activeUser);
router.put("/update", authenticateToken, checkUserActive ,authController.updateUser);


export default router;