import { pool } from '../config/database.js';

export const requestModel = {
  create: async (userId, category, details) => {
    const result = await pool.query(
      `INSERT INTO requests (user_id, category, info)
       VALUES ($1,$2,$3) RETURNING *`,
      [userId, category, details]
    );
    return result.rows[0];
  },

  getById: async (id) => {
    const result = await pool.query(
      `SELECT r.*, rr.id AS response_id, rr.admin_id, rr.offer, rr.created_at AS response_created_at
       FROM requests r
       LEFT JOIN request_responses rr ON rr.request_id = r.id
       WHERE r.id=$1`,
      [id]
    );
    return result.rows;
  },

  getAll: async () => {
    const result = await pool.query(`SELECT * FROM requests ORDER BY created_at DESC`);
    return result.rows;
  },

  deleteMany: async (ids) => {
    const result = await pool.query(
      `DELETE FROM requests WHERE id = ANY($1::uuid[]) RETURNING *`,
      [ids]
    );
    return result.rows;
  },

  update: async (id, fields) => {
    const sets = Object.keys(fields).map((key, i) => `${key}=$${i+1}`).join(',');
    const values = Object.values(fields);
    const result = await pool.query(
      `UPDATE requests SET ${sets} WHERE id=$${values.length+1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  getByUser : async (userId) => {
  const result = await pool.query(
      `
      SELECT 
        r.id,
        r.category,
        r.info,
        r.status,
        r.created_at,
        r.updated_at,
        u.nom,
        u.prenom,
        u.email,
        u.phone
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      `,
      [userId]
    );

    return result.rows;
  }
};
