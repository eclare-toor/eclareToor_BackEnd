import { pool } from "../config/database.js";

export const bookingModel = {
  create: async (userId, tripId, adult, child, baby, prix_calculer, prix_vrai_paye) => {
    const result = await pool.query(
      `INSERT INTO bookings 
      (user_id, trip_id, passengers_adult, passengers_child, passengers_baby, status, prix_calculer, prix_vrai_paye)
      VALUES ($1,$2,$3,$4,$5,'PENDING',$6,$7)
      RETURNING *`,
      [
        userId,
        tripId,
        adult,
        child,
        baby,
        prix_calculer,
        prix_vrai_paye ?? prix_calculer   // 🔥 fallback
      ]
    );
    return result.rows[0];
  },


  update: async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setQuery = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE bookings SET ${setQuery}, updated_at=NOW() WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query("DELETE FROM bookings WHERE id=$1 RETURNING *", [id]);
    return result.rows[0];
  },

  getById: async (id) => {
    const result = await pool.query("SELECT * FROM bookings WHERE id=$1", [id]);
    return result.rows[0];
  },

  getByUser: async (userId) => {
  const result = await pool.query(
    `
      SELECT 
        b.*,
        u.nom, 
        u.prenom,
        u.email,
        t.title,
        t.destination_country,
        t.type,
        t.omra_category,
        t.base_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN trips t ON b.trip_id = t.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
    [userId]
  );

  return result.rows;
},

  getAll: async () => {
    const result = await pool.query(`
      SELECT b.*, u.nom, u.prenom , u.email , t.title , t.destination_country , t.type , t.omra_category , t.base_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN trips t ON b.trip_id = t.id
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }
};
