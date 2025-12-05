import { pool } from "../config/database.js";

export const tripModel = {

  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO trips
      (type, title, description, start_date, end_date, base_price,
       images, equipment_list, destination_wilaya, destination_country, omra_category)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        data.type, data.title, data.description,
        data.start_date, data.end_date, data.base_price,
        data.images ?? [],
        data.equipment_list ?? null,
        data.destination_wilaya ?? null,
        data.destination_country ?? null,
        data.omra_category ?? null
      ]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query("SELECT * FROM trips ORDER BY created_at DESC");
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query("SELECT * FROM trips WHERE id=$1", [id]);
    return result.rows[0];
  },

  updateInfo: async (id, data) => {
    const result = await pool.query(
      `UPDATE trips SET
          type=$1, title=$2, description=$3, start_date=$4, end_date=$5,
          base_price=$6, equipment_list=$7, destination_wilaya=$8,
          destination_country=$9, omra_category=$10,
          updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
        data.type, data.title, data.description,
        data.start_date, data.end_date, data.base_price,
        data.equipment_list, data.destination_wilaya,
        data.destination_country, data.omra_category, id
      ]
    );

    return result.rows[0];
  },

  updateImages: async (id, images) => {
    const result = await pool.query(
      "UPDATE trips SET images=$1, updated_at=NOW() WHERE id=$2 RETURNING images",
      [images, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query("DELETE FROM trips WHERE id=$1", [id]);
  }
};
