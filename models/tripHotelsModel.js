import { pool } from "../config/database.js";

export const tripHotelsModel = {
  async add(tripId, hotelId, description) {
    const q = `
      INSERT INTO trip_hotels (trip_id, hotel_id, description)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const r = await pool.query(q, [tripId, hotelId, description]);
    return r.rows[0];
  },

  async getByTrip(tripId) {
    const q = `
      SELECT th.*, h.name, h.city, h.stars, h.address , h.images[1] as image
      FROM trip_hotels th
      JOIN hotels h ON th.hotel_id = h.id
      WHERE th.trip_id = $1`;
    const r = await pool.query(q, [tripId]);
    return r.rows;
  },

  async delete(tripId, hotelId) {
    await pool.query(
      `DELETE FROM trip_hotels WHERE trip_id=$1 AND hotel_id=$2`,
      [tripId, hotelId]
    );
  },

  async deleteByTrip(tripId) {
    await pool.query(
      `DELETE FROM trip_hotels WHERE trip_id=$1`,
      [tripId]
    );
  },

  async update(tripId, hotelId, description) {
        const q = `
            UPDATE trip_hotels 
            SET description = $3
            WHERE trip_id = $1 AND hotel_id = $2
            RETURNING *`;

        const r = await pool.query(q, [tripId, hotelId, description]);
        return r.rows[0];
    }
};
