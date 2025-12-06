import { tripHotelsModel } from "../models/tripHotelsModel.js";
import { hotelModel } from "../models/hotelModel.js";
import { tripModel } from "../models/tripModel.js";

export const tripHotelsService = {
  addManyHotels: async (tripId, hotels) => {
    try {
        // Validation tripId
        if (!tripId) throw new Error("Trip ID is required");

        let inserted = [];

        for (const h of hotels) {
        if (!h.hotel_id) throw new Error("hotel_id is missing in one entry");
            const result = await tripHotelsModel.add(tripId, h.hotel_id, h.description || null);
            inserted.push(result);
        }

        return inserted;

    } catch (err) {
        throw new Error("Error adding multiple hotels: " + err.message);
    }
  },
  async getHotelsByTrip(tripId) {
    try{
      return await tripHotelsModel.getByTrip(tripId);
    }catch(err){
      throw new Error("Error retrieving hotels for trip: " + err.message);
    }
    return await tripHotelsModel.getByTrip(tripId);
  },
  
  async deleteHotel(tripId, hotelId) {
    return await tripHotelsModel.delete(tripId, hotelId);
  },
  async updateHotel(tripId, hotelId, description) {
        if (!description) throw new Error("Description is required");

        const updated = await tripHotelsModel.update(tripId, hotelId, description);

        if (!updated) {
            throw new Error("Relation trip/hotel not found");
        }

        return updated;
    }


};
