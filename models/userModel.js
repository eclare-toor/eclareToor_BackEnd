import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

export class UserModel {
  // Vérifier si un email existe déjà
  static async findByEmail(email) {
    const result = await query(
      `SELECT id, nom, prenom, email, password, role, is_active, created_at, linkFacebook, nationalite, phone 
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  // Vérifier si un utilisateur existe par ID
  static async findById(id) {
    const result = await query(
      `SELECT id, nom, prenom, email, role, is_active, created_at, linkFacebook, nationalite, phone
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Créer un nouvel utilisateur
  static async create({ nom, prenom, email, hashedPassword, linkFacebook = null, role = 'user', nationalite, phone }) {
    const result = await query(
      `INSERT INTO users (nom, prenom, email, password, linkFacebook, role, nationalite, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nom, prenom, email, role, is_active, created_at, linkFacebook, nationalite, phone`,
      [nom, prenom, email, hashedPassword, linkFacebook, role, nationalite, phone]
    );
    return result.rows[0];
  }

  // Supprimer plusieurs utilisateurs
  static async deleteMany(userIds = []) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("La liste des IDs est vide");
    }

    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    const sql = `DELETE FROM users WHERE id IN (${placeholders})`;

    return await query(sql, userIds);
  }

  // Hasher un mot de passe
  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  // Vérifier un mot de passe
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}
