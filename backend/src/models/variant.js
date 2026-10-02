const db = require('../db');
async function create({ product_id, option_values = {} }) {
  const { rows } = await db.query(
    `INSERT INTO variants (product_id, option_values) VALUES ($1,$2) RETURNING *`,
    [product_id, option_values]
  );
  return rows[0];
}
module.exports = { create };