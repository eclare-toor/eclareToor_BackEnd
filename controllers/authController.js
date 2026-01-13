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

  static async getAllUsers(req, res) {
    try {
      const users = await authService.getUsers();
      res.json({ users });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async activeUser(req, res) {
    try {
      const { userId , status} = req.body; // Expect userId as query parameter
      const result = await authService.activateUser(userId, status);
      res.json({ message: 'Utilisateur status changer avec succès', ...result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // update profile method can be added here

  static async updateUser(req, res){
    try {
      const connectedUser = req.user; // depuis JWT
      const { id_user, ...data } = req.body;

      let targetUserId;

      // Admin → peut choisir qui modifier
      if (connectedUser.role === "admin" && id_user) {
        targetUserId = id_user;
      }
      // User → ne peut modifier que lui-même
      else {
        targetUserId = connectedUser.userId;
      }

      const user = await authService.updateUser(connectedUser, targetUserId, data);

      res.json({ message: "User updated", user });

    } catch (err) {
      if (err.message === "FORBIDDEN")
        return res.status(403).json({ message: "Access denied" });

      if (err.message === "NO_FIELDS")
        return res.status(400).json({ message: "No valid fields to update" });

      res.status(500).json({ message: err.message });
    }
  }

}
