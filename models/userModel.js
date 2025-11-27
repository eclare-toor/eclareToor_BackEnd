import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

// Vérifier si un email existe déjà
export const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT id, nom, prenom, email, password, role, is_active, created_at, linkFacebook FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Vérifier si un utilisateur existe par ID
export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, nom, prenom, email, role, is_active, created_at, linkFacebook FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Créer un nouvel utilisateur
export const createUser = async (nom, prenom, email,hashedPassword, linkFacebook = null,role= 'user') => {
  const result = await query(
    `INSERT INTO users (nom, prenom, email, password, linkFacebook , role) 
     VALUES ($1, $2, $3, $4, $5 , $6) 
     RETURNING id, nom, prenom, email, role, is_active, created_at, linkFacebook`,
    [nom, prenom, email, hashedPassword, linkFacebook , role]
  );
  return result.rows[0];
};

// Hasher un mot de passe
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Vérifier un mot de passe
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};