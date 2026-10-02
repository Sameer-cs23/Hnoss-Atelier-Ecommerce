const db = require('../db');
async function create({ variant_id, sku_code, price_minor, stock_quantity = 0, active = true }) {
  const { rows } = await db.query(
    `INSERT INTO skus (variant_id, sku_code, price_minor, stock_quantity, active)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [variant_id, sku_code, price_minor, stock_quantity, active]
  );
  return rows[0];
}
async function update(id, patch) {
  const fields = Object.keys(patch);
  if (!fields.length) return null;
  const set = fields.map((f, i) => `${f}=$${i + 1}`).join(',');
  const { rows } = await db.query(
    `UPDATE skus SET ${set}, updated_at=now() WHERE id=$${fields.length + 1} RETURNING *`,
    [...fields.map(f => patch[f]), id]
  );
  return rows[0] || null;
}
module.exports = { create, update };