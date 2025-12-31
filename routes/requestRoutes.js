import express from 'express';
import { requestController } from '../controllers/requestController.js';
import { authenticateToken , requireAnyRole} from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, requireAnyRole(["user"]),requestController.create);
router.get('/', authenticateToken, requireAnyRole(["admin"]) ,requestController.getAll);
router.get("/mine", authenticateToken, requestController.getMine);
router.get('/:id', authenticateToken, requestController.getById);
router.put('/:id', authenticateToken, requestController.update);
router.delete('/', authenticateToken, requireAnyRole(["admin"]) , requestController.deleteMany);

export default router;
