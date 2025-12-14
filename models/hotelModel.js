import { pool } from "../config/database.js";

export const hotelModel = {
  create: async (name, city , stars , address , maps_url = null , type = null) => {
    const result = await pool.query(
      `INSERT INTO hotels (name, city, stars, address, maps_url , type)
       VALUES ($1, $2, $3, $4, $5 ,$6)
       RETURNING *`,
      [name ,city ,stars ,address , maps_url , type]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query("SELECT * FROM hotels ORDER BY created_at DESC");
    return result.rows;
  },

  getByType: async (type) => {
    const result = await pool.query("SELECT * FROM hotels WHERE type=$1 ORDER BY created_at DESC", [type]);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query("SELECT * FROM hotels WHERE id=$1", [id]);
    return result.rows[0];
  },

  updateInfo: async (id, data) => {
    const result = await pool.query(
      `UPDATE hotels 
       SET name=$1, city=$2, stars=$3, address=$4, maps_url=$5, type=$6 ,updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [data.name, data.city, data.stars, data.address, data.maps_url, data.type ,id]
    );
    return result.rows[0];
  },

  updateImages: async (id, images) => {
    const result = await pool.query(
      "UPDATE hotels SET images=$1, updated_at=NOW() WHERE id=$2 RETURNING images",
      [images, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query("DELETE FROM hotels WHERE id=$1", [id]);
  }
};
