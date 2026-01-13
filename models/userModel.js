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

  // Récupérer tous les utilisateurs
  static async findAll() {
    const result = await query(
      `SELECT id, nom, prenom, email, role, is_active, created_at, linkFacebook, nationalite, phone 
       FROM users`
    );
    return result.rows;
  }
  
  // Activer ou désactiver un utilisateur
  static async setActiveStatus(userId, isActive) {
    const result = await query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, nom, prenom, email, role, is_active, created_at, linkFacebook, nationalite, phone`,
      [isActive, userId]
    );
    return result.rows[0];
  }

  // update user details
  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const { rows } = await query(
      `UPDATE users SET ${setClause} WHERE id=$${keys.length + 1}
       RETURNING id, nom, prenom, email, phone, nationalite, role, is_active`,
      [...values, id]
    );

    return rows[0];
  }
}
