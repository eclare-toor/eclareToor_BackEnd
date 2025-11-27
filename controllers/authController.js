import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';

// INSCRIPTION
export const register = async (req, res) => {
  try {
    const { nom, prenom, email, password, linkFacebook , role} = req.body;

    // 1. Validation des champs obligatoires
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ 
        error: 'Nom, prénom, email et mot de passe sont obligatoires' 
      });
    }

    // 2. Vérifier si email existe
    const userExists = await userModel.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await userModel.hashPassword(password);

    // 4. Créer l'utilisateur
    const newUser = await userModel.createUser(nom, prenom, email, hashedPassword, linkFacebook ,role);

    // 5. Générer le token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// CONNEXION
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont obligatoires' });
    }

    // 2. Trouver l'utilisateur
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 3. Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(400).json({ error: 'Compte désactivé' });
    }

    // 4. Vérifier le mot de passe
    const validPassword = await userModel.verifyPassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 5. Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '3d' }
    );

    // 6. Retourner sans le password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PROFIL UTILISATEUR
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};