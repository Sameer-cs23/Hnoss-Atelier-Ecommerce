const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

test('unauthenticated admin write → 401', async () => {
  const res = await request(app).post('/api/v1/admin/products').send({ name: 'x', slug: 'x', category_id: 1 });
  expect(res.status).toBe(401);
  expect(res.body.error).toBe('UNAUTHENTICATED');
});

test('non-admin role → 403', async () => {
  const token = jwt.sign({ role: 'customer' }, process.env.JWT_SECRET);
  const res = await request(app)
    .post('/api/v1/admin/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'x', slug: 'x', category_id: 1 });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('FORBIDDEN');
});

test('invalid token → 401', async () => {
  const res = await request(app)
    .post('/api/v1/admin/products')
    .set('Authorization', 'Bearer not-a-jwt')
    .send({ name: 'x', slug: 'x', category_id: 1 });
  expect(res.status).toBe(401);
});