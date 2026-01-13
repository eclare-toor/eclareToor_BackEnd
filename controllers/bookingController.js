import { bookingService } from "../services/bookingService.js";

export const bookingController = {
  create: async (req, res) => {
    try {
      const booking = await bookingService.create(req.user, req.body);
      res.status(201).json(booking);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const booking = await bookingService.update(
        req.params.id,
        req.user,
        req.body
      );
      res.json(booking);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  getMine: async (req, res) => {
    try {
      const result = await bookingService.getByUser(req.user,req.body);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const result = await bookingService.getAll();
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      const deleted = await bookingService.delete(req.params.id);
      res.json(deleted);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  async getByTrip(req, res) {
    try {
      const { tripId } = req.params;

      const result = await bookingService.getByTrip(tripId);

      res.json(result);

    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
};
