import { tripHotelsService } from "../services/tripHotelsService.js";

export const tripHotelsController = {
  add: async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const hotels = req.body.hotels; // tableau d’objets

        if (!Array.isArray(hotels) || hotels.length === 0) {
        return res.status(400).json({ error: "Hotels array is required" });
        }

        const result = await tripHotelsService.addManyHotels(tripId, hotels);
        res.status(201).json(result);

    } catch (e) {
        res.status(400).json({ error: e.message });
    }
   },


  getByTrip: async (req, res) => {
    try {
      const hotels = await tripHotelsService.getHotelsByTrip(req.params.tripId);
      res.json(hotels);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      await tripHotelsService.deleteHotel(req.params.tripId, req.params.hotelId);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
        const updated = await tripHotelsService.updateHotel(
        req.params.tripId,
        req.params.hotelId,
        req.body.description
        );
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

};
