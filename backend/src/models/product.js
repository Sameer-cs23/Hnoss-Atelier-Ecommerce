const db = require('../db');

function validateSpecifications(spec) {
  if (spec == null) return {};
  if (typeof spec !== 'object' || Array.isArray(spec))
    throw Object.assign(new Error('specifications must be a JSON object'), { status: 422, code: 'INVALID_SPECIFICATIONS' });
  const keys = Object.keys(spec);
  if (keys.length > 50)
    throw Object.assign(new Error('specifications exceeds 50 keys'), { status: 422, code: 'INVALID_SPECIFICATIONS' });
  for (const k of keys) {
    const v = spec[k];
    if (v !== null && typeof v === 'object')
      throw Object.assign(new Error('specifications values must be scalar'), { status: 422, code: 'INVALID_SPECIFICATIONS' });
  }
  return spec;
}

async function create({ category_id, name, slug, description = null, status = 'draft', specifications = {} }) {
  const specs = validateSpecifications(specifications);
  const { rows } = await db.query(
    `INSERT INTO products (category_id, name, slug, description, status, specifications)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [category_id, name, slug, description, status, specs]
  );
  return rows[0];
}

async function list({ category_id, status } = {}) {
  const where = []; const args = [];
  if (category_id) { args.push(category_id); where.push(`category_id=$${args.length}`); }
  if (status)      { args.push(status);      where.push(`status=$${args.length}`); }
  const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
  return (await db.query(sql, args)).rows;
}

async function getById(id) {
  const { rows } = await db.query('SELECT * FROM products WHERE id=$1', [id]);
  return rows[0] || null;
}

async function update(id, patch) {
  if (patch.specifications !== undefined) patch.specifications = validateSpecifications(patch.specifications);
  const fields = Object.keys(patch);
  if (!fields.length) return null;
  const set = fields.map((f, i) => `${f}=$${i + 1}`).join(',');
  const { rows } = await db.query(
    `UPDATE products SET ${set}, updated_at=now() WHERE id=$${fields.length + 1} RETURNING *`,
    [...fields.map(f => patch[f]), id]
  );
  return rows[0] || null;
}

module.exports = { create, list, getById, update, validateSpecifications };