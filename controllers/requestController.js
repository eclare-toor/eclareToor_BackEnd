import { requestService } from '../services/requestService.js';

export const requestController = {
  create: async (req, res) => {
    try {
      const userId = req.user.userId; // récupéré depuis le middleware auth
      const { category, details } = req.body;
      console.log("category: ",category)
      const request = await requestService.create(userId, category, details);
      res.status(201).json({ success: true, data: request });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const requests = await requestService.getAll();
      res.json({ success: true, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const request = await requestService.getById(id);
      res.json({ success: true, data: request });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const fields = req.body;
      const updated = await requestService.update(id, fields);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  deleteMany: async (req, res) => {
    try {
      const { ids } = req.body; // attend { ids: ["id1","id2",...] }
      const result = await requestService.deleteMany(ids);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  getMine : async (req, res) => {
    try {
      const result = await requestService.getByUser(
        req.user,     // user depuis JWT
        req.body      // body (utilisé seulement par admin)
      );
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
};
