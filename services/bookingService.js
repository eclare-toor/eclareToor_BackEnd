import { bookingModel } from "../models/bookingModel.js";
import { tripModel } from "../models/tripModel.js";
import { UserModel } from "../models/userModel.js";
import { NotificationService } from "./notificationServer.js";

export const bookingService = {
  async create(user, data) {
    const { role, userId} = user;
    const {
      user_id = null,
      trip_id,
      passengers_adult,
      passengers_child = 0,
      passengers_baby = 0,
      prix_calculer,
      prix_vrai_paye
    } = data;

    let userExists = null;
    let finalUserId;

    if (!trip_id || passengers_adult == null || prix_calculer == null) {
      throw new Error("Missing required fields");
    }

    if (isNaN(prix_calculer) || prix_calculer <= 0) {
      throw new Error("Invalid prix_calculer");
    }
    // Vérifier que le trip existe
    const trip = await tripModel.getById(trip_id);
    if (!trip) throw new Error("Trip not found");

    const finalPrixVrai = (user.role === "admin" && prix_vrai_paye)
    ? prix_vrai_paye
    : prix_calculer;

    if (role === "admin") {

      // ADMIN → doit envoyer user_id
      if (!user_id) {
        throw new Error("Admin must provide user_id to create booking");
      }
      userExists = await UserModel.findById(user_id);
      if (!userExists) {
        throw new Error("User not found");
      }
      
      if(userExists.role === "admin" ){
        throw new Error("Admin must provide user_id to create booking");
      }
      finalUserId = user_id;

    } else {
      // USER → ne peut pas spécifier un autre user_id
      userExists = await UserModel.findById(userId);
      if (!userExists) {
        throw new Error("User not found");
      }
      finalUserId = userId;
    }
    console.log("Final User ID for booking:", finalUserId);
    //verifier que l'utilisateur n'a pas déjà une réservation pour ce voyage
    const existingBookings = await bookingModel.getByUser(finalUserId);
    const hasExistingBooking = existingBookings.some(
      (booking) => booking.trip_id === trip_id
    );
    if (hasExistingBooking) {
      throw new Error("User already has a booking for this trip");
    }
    
    // Création de la réservation
    const newBooking = await bookingModel.create(
      finalUserId,
      trip_id,
      passengers_adult,
      passengers_child,
      passengers_baby,
      prix_calculer,
      finalPrixVrai
    );
     
    // Envoi de notification aux admins
    try {
      const bookingInfo = {
        tripName: trip.title,
        userName: `${userExists ? userExists.nom : ''} ${userExists ? userExists.prenom : ''}`,
        bookingId: newBooking.id
      };
      await NotificationService.notifyAdminsNewBooking(bookingInfo);
    } catch (err) {
      console.error("Erreur notification admins:", err);
    }

    return newBooking;
  },

  async update(bookingId, user, data) {
    try {
      const booking = await bookingModel.getById(bookingId);
      if (!booking) throw new Error("Booking not found");
    
      // USER cannot modify someone else's booking
      if (user.role !== "admin" && booking.user_id !== user.userId) {
        throw new Error("You cannot modify this booking");
      }
      const fields = {};

      if (data.prix_vrai_paye != null) {
        if (user.role !== "admin") {
          throw new Error("Only admin can modify price");
        }
        fields.prix_vrai_paye = data.prix_vrai_paye;
      }

      // Update passengers
      if (data.passengers_adult != null) fields.passengers_adult = data.passengers_adult;
      if (data.passengers_child != null) fields.passengers_child = data.passengers_child;
      if (data.passengers_baby != null) fields.passengers_baby = data.passengers_baby;
      fields.prix_calculer = data.prix_calculer != null ? data.prix_calculer : booking.prix_calculer; // keep original calculated price
      // Status update management
      if (data.status) {
        if (user.role !== "admin") {
          if (data.status !== "CANCELLED" || booking.status !== "PENDING") {
            throw new Error("User can only cancel their pending booking");
          }
        }
        fields.status = data.status;
      }

      // DB update
      const updatedBooking = await bookingModel.update(bookingId, fields);
      // ---------------------------
      // 🔔 NOTIFICATIONS (safe mode)
      // ---------------------------
      try {
        if (fields.status) {
          const trip = await tripModel.getById(updatedBooking.trip_id);

          if (user.role === "admin") {
            // Admin → notify the user
            await this.notifyUserBooking(
              updatedBooking.user_id,
              { tripName: trip.title, bookingId: updatedBooking.id },
              fields.status
            );

          } else {
            // User cancels their booking → notify admins
            const u = await UserModel.findById(updatedBooking.user_id);

            await NotificationService.notifyAdminsBookingCancelledByUser({
              bookingId: updatedBooking.id,
              tripName: trip.title,
              userName: `${u.prenom} ${u.nom}`
            });
          }
        }
      } catch (notifErr) {
        console.error("⚠️ Notification failed:", notifErr.message);
        // No throw → booking remains updated normally
      }

      return updatedBooking;

    } catch (error) {
      throw new Error("Error updating booking: " + error.message);
    }
  },

  // Notification selon le status de la réservation
  async notifyUserBooking(userId, bookingData, status) {
    try {
      switch (status) {
        case "CONFIRMED":
          await NotificationService.notifyUserBookingConfirmed(userId, bookingData);
          break;
        case "CANCELLED":
          await NotificationService.notifyUserBookingCancelled(userId, bookingData);
          break;
        case "PAID":
          await NotificationService.notifyUserPaymentSuccess(userId, bookingData);
          break;
        case "PENDING":
          await NotificationService.notifyUserBookingPending(userId, bookingData);
          break;
        default:
          console.warn("Unknown booking status for notification:", status);
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  },

  async getByUser(user , data) {
    let userId
    if (user.role === "admin") {
      const { user_id = null } = data;
      if(!user_id){
        throw new Error("Admin must provide user_id to get bookings");
      }
      const userExists = await UserModel.findById(user_id);
      if (!userExists) {
        throw new Error("User not found");
      }
      userId = user_id;
    } else {
      userId = user.userId;
    }
    return await bookingModel.getByUser(userId); 
  },

  async getAll() {
    return await bookingModel.getAll();
  },

  async delete(id) {
    return await bookingModel.delete(id);
  },
  
  async getByTrip(tripId) {
    const trip = await tripModel.getById(tripId);
    if (!trip) throw new Error("Trip not found");

    const bookings = await bookingModel.getByTrip(tripId);
    const stats = await bookingModel.statsByTrip(tripId);

    return {
      trip: {
        id: trip.id,
        title: trip.title,
        destination: trip.destination_country
      },
      stats,
      bookings
    };
  }
};
