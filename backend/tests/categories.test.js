const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET);
const auth = (r) => r.set('Authorization', `Bearer ${token}`);

test('creates category (201)', async () => {
  const res = await auth(request(app).post('/api/v1/admin/categories'))
    .send({ name: 'Women', slug: `women-${Date.now()}-${Math.random().toString(36).slice(2,7)}` });
  expect(res.status).toBe(201);
});                                                                                                                                                                                                   

test('duplicate slug → 409', async () => {
  const slug = `dupe-${Date.now()}`;
  await auth(request(app).post('/api/v1/admin/categories')).send({ name: 'A', slug });
  const res = await auth(request(app).post('/api/v1/admin/categories')).send({ name: 'B', slug });
  expect(res.status).toBe(409);
  expect(res.body.error).toBe('DUPLICATE_VALUE');
});

test('missing fields → 422', async () => {
  const res = await auth(request(app).post('/api/v1/admin/categories')).send({ name: 'Only' });
  expect(res.status).toBe(422);
});

test('cycle prevention: A→B→A rejected', async () => {
  const a = await auth(request(app).post('/api/v1/admin/categories'))
    .send({ name: 'A', slug: `a-${Date.now()}` });
  const b = await auth(request(app).post('/api/v1/admin/categories'))
    .send({ name: 'B', slug: `b-${Date.now()}`, parent_id: a.body.id });
  const res = await auth(request(app).patch(`/api/v1/admin/categories/${a.body.id}`))
    .send({ parent_id: b.body.id });
  expect(res.status).toBe(422);
  expect(res.body.error).toBe('CYCLE');
});

test('GET returns nested tree', async () => {
  const res = await auth(request(app).get('/api/v1/admin/categories'));
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('children');
});