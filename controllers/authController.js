import { authService } from '../services/authService.js';

export class authController {
  static async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ message: 'Compte créé avec succès', ...result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ message: 'Connexion réussie', ...result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.userId);
      res.json({ user });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async deleteManyUsers(req, res) {
    try {
      const { userIds } = req.body; // Expect array of IDs
      const currentUser = req.user; // Injecté par authenticateToken middleware

      const result = await authService.deleteMany(userIds, currentUser);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}
