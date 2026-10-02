const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET);
const auth = (r) => r.set('Authorization', `Bearer ${token}`);

test('creates product with required fields (201)', async () => {
  const res = await auth(request(app).post('/api/v1/admin/products'))
    .send({ name: 'Test', slug: `test-${Date.now()}`, category_id: 2 });
  expect(res.status).toBe(201);
  expect(res.body.status).toBe('draft');
});

test('duplicate slug → 409', async () => {
  const slug = `dup-${Date.now()}`;
  await auth(request(app).post('/api/v1/admin/products')).send({ name: 'A', slug, category_id: 2 });
  const res = await auth(request(app).post('/api/v1/admin/products')).send({ name: 'B', slug, category_id: 2 });
  expect(res.status).toBe(409);
});

test('missing required fields → 422', async () => {
  const res = await auth(request(app).post('/api/v1/admin/products')).send({ name: 'No Slug' });
  expect(res.status).toBe(422);
});

test('invalid specifications (array) → 422', async () => {
  const res = await auth(request(app).post('/api/v1/admin/products'))
    .send({ name: 'Spec', slug: `spec-${Date.now()}`, category_id: 2, specifications: [1, 2, 3] });
  expect(res.status).toBe(422);
  expect(res.body.error).toBe('INVALID_SPECIFICATIONS');
});

test('publishing without SKU → 422 (DB trigger)', async () => {
  const p = await auth(request(app).post('/api/v1/admin/products'))
    .send({ name: 'NoSKU', slug: `nosku-${Date.now()}`, category_id: 2 });
  const res = await auth(request(app).patch(`/api/v1/admin/products/${p.body.id}`))
    .send({ status: 'published' });
  expect(res.status).toBe(422);
  expect(res.body.error).toBe('BUSINESS_RULE');
});