import { requestResponseModel } from '../models/requestResponseModel.js';
import { requestModel } from '../models/requestModel.js';
import { NotificationService } from './notificationServer.js';

export const requestResponseService = {
  create: async (requestId, adminId, offer) => {
    try {
      if (!requestId || !adminId || !offer) throw new Error("Request ID, Admin ID and offer are required");

      const requestExists = await requestModel.getById(requestId);
      if (!requestExists || requestExists.length === 0) throw new Error("Request not found");

      const response = await requestResponseModel.create(requestId, adminId, offer);

      // 🔔 Notification USER
      const userId = requestExists[0].user_id;

      NotificationService.notifyUserRequestResponse(userId, {
        requestId,
        category: requestExists[0].category
      });
      return response;
    } catch (err) {
      throw new Error("Failed to create response: " + err.message);
    }
  },

  getById: async (id) => {
    try {
      if (!id) throw new Error("Response ID is required");
      const response = await requestResponseModel.getById(id);
      if (!response) throw new Error("Response not found");
      return response;
    } catch (err) {
      throw new Error("Failed to get response: " + err.message);
    }
  },

  getAll: async () => {
    try {
      return await requestResponseModel.getAll();
    } catch (err) {
      throw new Error("Failed to get responses: " + err.message);
    }
  },

  update: async (id, fields) => {
    try {
      if (!id) throw new Error("Response ID is required");
      if (!fields || Object.keys(fields).length === 0) throw new Error("No fields to update");

      const updated = await requestResponseModel.update(id, fields);
      if (!updated) throw new Error("Response not found or not updated");

      return updated;
    } catch (err) {
      throw new Error("Failed to update response: " + err.message);
    }
  },

  deleteMany: async (ids) => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) throw new Error("No IDs provided");
      return await requestResponseModel.deleteMany(ids);
    } catch (err) {
      throw new Error("Failed to delete responses: " + err.message);
    }
  }
};
