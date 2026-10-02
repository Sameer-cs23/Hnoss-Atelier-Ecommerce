const db = require('../db');

async function create({ parent_id = null, name, slug, active = true }) {
  if (parent_id) {
    const { rows } = await db.query('SELECT 1 FROM categories WHERE id=$1', [parent_id]);
    if (!rows.length) throw Object.assign(new Error('Parent not found'), { status: 422, code: 'PARENT_NOT_FOUND' });
  }
  const { rows } = await db.query(
    `INSERT INTO categories (parent_id, name, slug, active)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [parent_id, name, slug, active]
  );
  return rows[0];
}

async function listTree() {
  const { rows } = await db.query('SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name');
  const byId = new Map(rows.map(r => [r.id, { ...r, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) byId.get(node.parent_id).children.push(node);
    else roots.push(node);
  }
  return roots;
}

async function update(id, patch) {
  if (patch.parent_id) {
    let cur = patch.parent_id;
    while (cur) {
      if (cur === id) throw Object.assign(new Error('Category cannot be its own ancestor'), { status: 422, code: 'CYCLE' });
      const { rows } = await db.query('SELECT parent_id FROM categories WHERE id=$1', [cur]);
      cur = rows[0]?.parent_id;
    }
  }
  const fields = Object.keys(patch);
  if (!fields.length) return null;
  const set = fields.map((f, i) => `${f}=$${i + 1}`).join(',');
  const { rows } = await db.query(
    `UPDATE categories SET ${set}, updated_at=now() WHERE id=$${fields.length + 1} RETURNING *`,
    [...fields.map(f => patch[f]), id]
  );
  return rows[0] || null;
}

module.exports = { create, listTree, update };