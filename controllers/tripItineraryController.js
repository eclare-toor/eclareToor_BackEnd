import { tripItineraryService } from "../services/tripItineraryService.js";

export const tripItineraryController = {
  add: async (req, res) => {
    try {
      const entry = await tripItineraryService.addDay(
        req.params.tripId,
        req.body.day_date,
        req.body.activities
      );
      res.status(201).json(entry);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
    addMany: async (req, res) => {
        try {
        const tripId = req.params.tripId;
        const { itineraries } = req.body;

        const result = await tripItineraryService.addMany(tripId, itineraries);

        res.status(201).json(result);
        } catch (e) {
        res.status(400).json({ error: e.message });
        }
    },
  getByTrip: async (req, res) => {
    try {
      const entries = await tripItineraryService.getTripItinerary(req.params.tripId);
      res.json(entries);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      await tripItineraryService.deleteDay(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
        const updated = await tripItineraryService.updateDay(
        req.params.id,
        req.params.tripId,
        req.body.day_date,
        req.body.activities
        );

        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
  }

};
