import { requestModel } from '../models/requestModel.js';
import { NotificationService } from './notificationServer.js';
import { UserModel } from '../models/userModel.js';

export const requestService = {
  create: async (userId, category, details) => {
    try {
      if (!category || !details) throw new Error("Category and details are required");

      const request = await requestModel.create(userId, category, details);

      // Notification aux admins
      const user = await UserModel.findById(userId);
      await NotificationService.notifyAllAdmins('ADMIN_NEW_CONTACT', {
        userName: `${user.prenom} ${user.nom}`,
        category,
        requestId: request.id
      });
      NotificationService.notifyAdminsNewRequest({
        userName: `${user.prenom} ${user.nom}`,
        category,
        requestId: request.id
      }).catch(console.error);


      return request;
    } catch (err) {
      throw new Error("Failed to create request: " + err.message);
    }
  },

  getById: async (id) => {
    try {
      if (!id) throw new Error("Request ID is required");
      const requests = await requestModel.getById(id);
      if (!requests || requests.length === 0) throw new Error("Request not found");
      return requests;
    } catch (err) {
      throw new Error("Failed to get request: " + err.message);
    }
  },

  getAll: async () => {
    try {
      return await requestModel.getAll();
    } catch (err) {
      throw new Error("Failed to get requests: " + err.message);
    }
  },

  update: async (id, fields) => {
    try {
      if (!id) throw new Error("Request ID is required");
      if (!fields || Object.keys(fields).length === 0) throw new Error("No fields to update");

      const updated = await requestModel.update(id, fields);
      if (!updated) throw new Error("Request not found or not updated");

      return updated;
    } catch (err) {
      throw new Error("Failed to update request: " + err.message);
    }
  },

  deleteMany: async (ids) => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) throw new Error("No IDs provided");
      return await requestModel.deleteMany(ids);
    } catch (err) {
      throw new Error("Failed to delete requests: " + err.message);
    }
  },

  getByUser: async(user, data) =>{
    let userId;
    // 🔐 ADMIN
    if (user.role === "admin") {
      const { user_id = null } = data;

      if (!user_id) {
        throw new Error("Admin must provide user_id to get requests");
      }

      const userExists = await UserModel.findById(user_id);
      if (!userExists) {
        throw new Error("User not found");
      }

      userId = user_id;
    }
    // 🔐 USER
    else {
      userId = user.userId;
    }
    return await requestModel.getByUser(userId);
  }
};
