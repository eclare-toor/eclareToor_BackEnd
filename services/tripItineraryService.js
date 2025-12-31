import { tripItineraryModel } from "../models/tripItineraryModel.js";
import { tripModel } from "../models/tripModel.js";

export const tripItineraryService = {
  async addDay(tripId, dayDate, activities) {
    const trip = await tripModel.getById(tripId);

    if (dayDate < trip.start_date || dayDate > trip.end_date) {
      throw new Error("day_date must be between trip start_date and end_date");
    }

    return await tripItineraryModel.add(tripId, dayDate, activities);
  },
async addMany(trip_id, itineraries) {
    if (!Array.isArray(itineraries) || itineraries.length === 0)
      throw new Error("Itineraries array required");

    const trip = await tripModel.getById(trip_id);
    if (!trip) throw new Error("Trip not found");

    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    const inserted = [];

    for (const item of itineraries) {
      console.log(item);
      if (!item.day_date || !item.activities)
        throw new Error("Missing fields in one entry");

      const itineraryDate = new Date(item.day_date);
      if (itineraryDate < tripStart || itineraryDate >tripEnd) {
        throw new Error(`Date ${item.day_date} out of trip range`);
      }

      const result = await tripItineraryModel.add(
        trip_id,
        item.day_date,
        item.activities
      );
      inserted.push(result);
    }

    return inserted;
  },

  async getTripItinerary(tripId) {
    return await tripItineraryModel.getByTrip(tripId);
  },

  async deleteDay(id) {
    return await tripItineraryModel.delete(id);
  },

  async updateDay(id, tripId, dayDate, activities) {
        if (!dayDate) throw new Error("day_date is required");

        const trip = await tripModel.getById(tripId);
        if (!trip) throw new Error("Trip not found");

        const tripStart = new Date(trip.start_date);
        const tripEnd = new Date(trip.end_date);
        const itineraryDate = new Date(dayDate);
        if (itineraryDate < tripStart || itineraryDate >tripEnd) {
          throw new Error(`Date ${dayDate} out of trip range`);
        }
        console.log(itineraryDate, tripStart, tripEnd);
        const updated = await tripItineraryModel.update(id, dayDate, activities);

        if (!updated) throw new Error("Itinerary entry not found");

        return updated;
    }

};
