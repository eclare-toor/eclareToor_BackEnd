import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { NotificationService } from './notificationServer.js';
import {generateToken} from '../middleware/auth.js';

export class authService {
  // Inscription
  static async register(data) {
    const { nom, prenom, email, password, linkFacebook, role, nationalite, phone } = data;

    if (!nom || !prenom || !email || !password || !nationalite || !phone) {
      throw new Error('il y a des champs obligatoires manquants');
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) throw new Error('Email déjà utilisé');

    const hashedPassword = await UserModel.hashPassword(password);

    const newUser = await UserModel.create({
      nom, prenom, email, hashedPassword, linkFacebook, role, nationalite, phone
    });

    const token = generateToken(newUser);

    // Notifications async
    Promise.all([
      NotificationService.notifyUserWelcome(newUser.id),
      NotificationService.notifyAdminsNewUser(newUser)
    ]).catch(console.error);

    return { token, user: newUser };
  }

  // Connexion
  static async login(email, password) {
    if (!email || !password) throw new Error('Email et mot de passe sont obligatoires');

    const user = await UserModel.findByEmail(email);
    if (!user || !user.is_active) throw new Error('Email ou mot de passe incorrect');

    const validPassword = await UserModel.verifyPassword(password, user.password);
    if (!validPassword) throw new Error('Email ou mot de passe incorrect');
    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  // Profil utilisateur
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  }
  
  // Suppression multiple d'utilisateurs
  static async deleteMany(userIds, currentUser) {
    if (currentUser.role !== 'admin') {
      throw new Error('Accès refusé : Admin uniquement');
    }

    if (!userIds || userIds.length === 0) {
      throw new Error('Aucun ID fourni');
    }

    const result = await UserModel.deleteMany(userIds);
    return { message: `${userIds.length} utilisateurs supprimés` };
  }

}
