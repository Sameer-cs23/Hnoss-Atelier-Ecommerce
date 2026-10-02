const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const db = require('../src/db');

const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET);
const auth = (r) => r.set('Authorization', `Bearer ${token}`);

test('duplicate SKU code → 409', async () => {
  // Ensure variant 1 exists
  const { rows: v } = await db.query('SELECT id FROM variants LIMIT 1');
  const variantId = v[0]?.id || 1;

  const code = `SKU-DUP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Clean up any existing row with this code (defensive)
  await db.query('DELETE FROM skus WHERE sku_code=$1', [code]);

  // First insert — should succeed
  const r1 = await auth(request(app).post(`/api/v1/admin/products/variants/${variantId}/skus`))
    .send({ sku_code: code, price_minor: 1000 });
  expect(r1.status).toBe(201);

  // Second insert with same code — should fail with 409
  const r2 = await auth(request(app).post(`/api/v1/admin/products/variants/${variantId}/skus`))
    .send({ sku_code: code, price_minor: 1000 });
  expect(r2.status).toBe(409);
});

test('negative price → 422', async () => {
  const res = await auth(request(app).post('/api/v1/admin/products/variants/1/skus'))
    .send({ sku_code: `NEG-${Date.now()}`, price_minor: -100 });
  expect(res.status).toBe(422);
});

test('negative stock on update → 422', async () => {
  const res = await auth(request(app).patch('/api/v1/admin/skus/1')).send({ stock_quantity: -5 });
  expect(res.status).toBe(422);
});

test('DB rejects negative stock even bypassing API', async () => {
  await expect(db.query('UPDATE skus SET stock_quantity=-1 WHERE id=1')).rejects.toThrow();
});

test('valid SKU update succeeds', async () => {
  const res = await auth(request(app).patch('/api/v1/admin/skus/1')).send({ stock_quantity: 10 });
  expect(res.status).toBe(200);
  expect(res.body.stock_quantity).toBe(10);
});