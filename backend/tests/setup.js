const fs = require('fs');
const path = require('path');
const db = require('../src/db');

beforeAll(async () => {
  const dir = path.join(__dirname, '..', 'src', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  await db.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  for (const f of files) await db.query(fs.readFileSync(path.join(dir, f), 'utf8'));

  await db.query(`INSERT INTO categories (id, name, slug) VALUES (1,'Men','men'),(2,'Shirts','men-shirts')`);
  await db.query(`INSERT INTO products (id, category_id, name, slug, status) VALUES (1,2,'P','p','draft')`);
  await db.query(`INSERT INTO variants (id, product_id) VALUES (1,1)`);
  await db.query(`INSERT INTO skus (id, variant_id, sku_code, price_minor, stock_quantity, active) VALUES (1,1,'SEED-1',1000,5,true)`);
});