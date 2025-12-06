import { pool } from "../config/database.js";

export const tripItineraryModel = {
  async add(tripId, dayDate, activities) {
    const q = `
      INSERT INTO trip_itineraries (trip_id, day_date, activities)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const r = await pool.query(q, [tripId, dayDate, activities]);
    return r.rows[0];
  },

  async getByTrip(tripId) {
    const r = await pool.query(
      `SELECT * FROM trip_itineraries
       WHERE trip_id=$1
       ORDER BY day_date ASC`,
      [tripId]
    );
    return r.rows;
  },

  async delete(id) {
    await pool.query(`DELETE FROM trip_itineraries WHERE id=$1`, [id]);
  },

  async deleteByTripId(tripId){
    await pool.query(`DELETE FROM trip_itineraries WHERE trip_id=$1`, [tripId]);
  },

  async update(id, dayDate, activities) {
        const q = `
            UPDATE trip_itineraries
            SET day_date = $2, activities = $3
            WHERE id = $1
            RETURNING *`;

        const r = await pool.query(q, [id, dayDate, activities]);
        return r.rows[0];
    }

};

// delete one by id
// delete all integrer et essayer 
// check day intervall et si existe deja??