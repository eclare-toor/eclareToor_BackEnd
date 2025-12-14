import { Notification } from '../models/notificationModel.js';
import { query } from '../config/database.js';

// Templates organisés par catégorie
const TEMPLATES = {
  // === NOTIFICATIONS USER ===
  USER: {
    WELCOME: {
      type: 'user_welcome',
      title: 'Bienvenue !',
      message: 'Votre compte a été créé avec succès.',
      action_url: '/profile'
    },
    BOOKING_CONFIRMED: {
      type: 'user_booking_confirmed', 
      title: 'Réservation confirmée !',
      message: 'Votre réservation à {tripName} est confirmée.',
      action_url: '/bookings/{bookingId}'
    },
    PAYMENT_SUCCESS: {
      type: 'user_payment_success',
      title: 'Paiement accepté',
      message: 'Votre paiement aux réservation {tripName} a été traité avec succès.',
      action_url: '/bookings/{bookingId}'
    },
    BOOKING_CANCELLED: {
      type: 'user_booking_cancelled',
      title: 'Réservation annulée',
      message: 'Votre réservation à {tripName} a été annulée.',
      action_url: '/bookings'
    },
    BOOKING_PENDING:{
      type: 'user_payment_pending',
      title: 'Réservation pending ...',
      message: 'Votre réservation à {tripName} est pending.',
      action_url: '/bookings/{bookingId}'
    }
  },

  // === NOTIFICATIONS ADMIN ===
  ADMIN: {
    NEW_USER: {
      type: 'admin_new_user',
      title: '👤 Nouvel utilisateur',
      message: '{userName} ({userEmail}) vient de créer un compte.',
      action_url: '/admin/users/{userId}'
    },
    NEW_BOOKING: {
      type: 'admin_new_booking',
      title: '🏨 Nouvelle réservation',
      message: 'Nouvelle réservation pour {tripName} pour  {userName}.',
      action_url: '/admin/bookings/{bookingId}'
    },
    PAYMENT_RECEIVED: {
      type: 'admin_payment_received', 
      title: '💳 Paiement reçu',
      message: 'Paiement de {amount}€ pour la réservation #{bookingId}.',
      action_url: '/admin/bookings/{bookingId}'
    },
    PAYMENT_FAILED: {
      type: 'admin_payment_failed',
      title: '❌ Paiement échoué',
      message: 'Paiement de {amount}€ échoué pour réservation #{bookingId}.',
      action_url: '/admin/bookings/{bookingId}'
    },
   BOOKING_CANCELLED_USER: {
      type: 'admin_booking_cancelled_user',
      title: 'Réservation annulée par un utilisateur',
      message: '{userName} a annulé sa réservation pour {tripName}.',
      action_url: '/admin/bookings/{bookingId}'
    },
    CONTACT_ADDED: {
      type: 'admin_new_contact',
      title: '📩 Nouveau communtaire',
      message: '{fullName} ({email}) a envoyé un nouveau commentaire.',
      action_url: '/admin/contacts/{contactId}'
    }

  }
};

export class NotificationService {
  // === METHODES FONDAMENTALES ===
  
  // Créer une notification
  static async create(userId, type, title, message, actionUrl = null, metadata = null, expiresAt = null) {
    return await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
      metadata,
      expires_at: expiresAt
    });
  }

  // Créer à partir d'un template
  static async createFromTemplate(userId, templateCategory, templateKey, variables = {}) {
    const template = TEMPLATES[templateCategory]?.[templateKey];
    if (!template) {
      throw new Error(`Template ${templateCategory}.${templateKey} non trouvé`);
    }

    // Remplacement des variables
    let message = template.message;
    let title = template.title;
    let action_url = template.action_url;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      const safeValue = String(value || '');
      message = message.replace(new RegExp(placeholder, 'g'), safeValue);
      title = title.replace(new RegExp(placeholder, 'g'), safeValue);
      if (action_url) {
        action_url = action_url.replace(new RegExp(placeholder, 'g'), safeValue);
      }
    }

    return await this.create(
      userId, 
      template.type, 
      title, 
      message, 
      action_url, 
      variables
    );
  }

  // === METHODES USER ===
  
  static async notifyUserWelcome(userId) {
    return await this.createFromTemplate(userId, 'USER', 'WELCOME');
  }

  static async notifyUserBookingConfirmed(userId, bookingData) {
    return await this.createFromTemplate(userId, 'USER', 'BOOKING_CONFIRMED', bookingData);
  }

  static async notifyUserPaymentSuccess(userId, paymentData) {
    return await this.createFromTemplate(userId, 'USER', 'PAYMENT_SUCCESS', paymentData);
  }

  static async notifyUserBookingCancelled(userId, bookingData) {
    return await this.createFromTemplate(userId, 'USER', 'BOOKING_CANCELLED', bookingData);
  }

  static async notifyUserBookingPending(userId, bookingData) {
    return await this.createFromTemplate(userId, 'USER', 'BOOKING_PENDING', bookingData);
  }

  // === METHODES ADMIN ===

  // Trouver tous les admins
  static async findAllAdmins() {
    const result = await query(
      'SELECT id FROM users WHERE role = $1',
      ['admin']
    );
    return result.rows.map(row => row.id);
  }

  // Notifier tous les admins
  static async notifyAllAdmins(templateKey, variables = {}) {
    const adminIds = await this.findAllAdmins();
    console.log(`👥 Envoi de la notification aux admins (${adminIds.length})`);
    if (adminIds.length === 0) {
      console.log('⚠️ Aucun admin trouvé');
      return [];
    }

    const promises = adminIds.map(adminId => 
      this.createFromTemplate(adminId, 'ADMIN', templateKey, variables)
    );

    const results = await Promise.allSettled(promises);
    
    // Log des résultats
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`📨 Notifications envoyées: ${successful} succès, ${failed} échecs`);
    
    return results;
  }

  // Méthodes admin spécifiques
  static async notifyAdminsNewUser(userData) {
    return await this.notifyAllAdmins('NEW_USER', {
      userName: `${userData.prenom} ${userData.nom}`,
      userEmail: userData.email,
      userId: userData.id
    });
  }

  static async notifyAdminsNewBooking(bookingData) {
    return await this.notifyAllAdmins('NEW_BOOKING', bookingData);
  }

  static async notifyAdminsPaymentReceived(paymentData) {
    return await this.notifyAllAdmins('PAYMENT_RECEIVED', paymentData);
  }

  static async notifyAdminsPaymentFailed(paymentData) {
    return await this.notifyAllAdmins('PAYMENT_FAILED', paymentData);
  }
  static async notifyAdminsBookingCancelledByUser(bookingData) {
    return await this.notifyAllAdmins('BOOKING_CANCELLED_USER', bookingData);
  }

  static async notifyAdminsNewContact(contactData) {
    return await this.notifyAllAdmins('CONTACT_ADDED', {
      contactId: contactData.id,
      fullName: contactData.full_name,
      email: contactData.email
    });
}

  // === METHODES DE LECTURE ===

  static async getUserNotifications(userId, options = {}) {
    return await Notification.findByUserId(userId, options);
  }

  static async getUnreadCount(userId) {
    return await Notification.countUnread(userId);
  }

  static async markAsRead(notificationId, userId) {
    return await Notification.markAsRead(notificationId, userId);
  }

  static async markAllAsRead(userId) {
    return await Notification.markAllAsRead(userId);
  }

  static async deleteNotification(notificationId, userId) {
    return await Notification.delete(notificationId, userId);
  }

  // Nettoyage des notifications expirées (à appeler périodiquement)
  static async cleanup() {
    return await Notification.cleanupExpired();
  }
}