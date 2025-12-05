import { tripService } from "../services/tripService.js";

export const tripController = {

  create: async (req, res) => {
    try {
      const trip = await tripService.create(req.body, req.files);
      res.status(201).json(trip);
    } catch (e) {
        res.status(400).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  getAll: async (req, res) => {
    try {
      res.json(await tripService.getAll());
    } catch (e) {
        res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  getById: async (req, res) => {
    try {
      res.json(await tripService.getById(req.params.id));
    } catch (e) {
      res.status(404).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  updateInfo: async (req, res) => {
    try {
      res.json(await tripService.updateInfo(req.params.id, req.body));
    } catch (e) {
      res.status(400).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  addImages: async (req, res) => {
    try {
      res.json(await tripService.addImages(req.params.id, req.files));
    } catch (e) {
      res.status(400).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  replaceImages: async (req, res) => {
    try {
      res.json(await tripService.replaceImages(req.params.id, req.body.namesToRemove, req.files));
    } catch (e) {
      res.status(400).json({
            success: false, 
            error: e.message 
        });
    }
  },

  deleteImages: async (req, res) => {
    try {
      res.json(await tripService.deleteManyImages(req.params.id, req.body.names));
    } catch (e) {
      res.status(400).json({ 
            success: false,
            error: e.message 
        });
    }
  },

  deleteTrip: async (req, res) => {
    try {
      await tripService.deleteTrip(req.params.id);
      res.json({ message: "Trip deleted" });
    } catch (e) {
      res.status(400).json({ 
            success: false,
            error: e.message 
        });
    }
  }
};
