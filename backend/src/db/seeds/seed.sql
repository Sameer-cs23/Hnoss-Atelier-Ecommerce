BEGIN;

-- Disable business trigger while seeding so published products can be
-- inserted before their SKUs; re-enabled below.
ALTER TABLE products DISABLE TRIGGER trg_published_product_has_sku;

TRUNCATE assets, skus, variants, products, categories RESTART IDENTITY CASCADE;

-- CATEGORIES (2 levels)
INSERT INTO categories (id, parent_id, name, slug) VALUES
  (1, NULL, 'Men',    'men'),
  (2, NULL, 'Women',  'women'),
  (3, 1,    'Shirts', 'men-shirts'),
  (4, 1,    'Jeans',  'men-jeans');

-- PRODUCTS (3, one multi-variant)
INSERT INTO products (id, category_id, name, slug, description, status) VALUES
  (1, 3, 'Classic Oxford Shirt', 'classic-oxford-shirt', 'Cotton oxford, regular fit', 'published'),
  (2, 4, 'Slim Fit Jeans',       'slim-fit-jeans',       'Stretch denim, mid-rise',    'published'),
  (3, 3, 'Linen Camp Shirt',     'linen-camp-shirt',     'Relaxed linen, summer',      'draft');

-- VARIANTS
INSERT INTO variants (id, product_id, option_values) VALUES
  (1, 1, '{"Size":"S","Color":"Blue"}'),
  (2, 1, '{"Size":"M","Color":"Blue"}'),
  (3, 1, '{"Size":"L","Color":"Blue"}'),
  (4, 2, '{"Waist":"32","Color":"Indigo"}');

-- SKUS — 4 valid + 1 intentionally unavailable combination
INSERT INTO skus (id, variant_id, sku_code, price_minor, stock_quantity, active) VALUES
  (1, 1, 'OX-S-BLUE',   4500, 10, TRUE),
  (2, 2, 'OX-M-BLUE',   4500,  8, TRUE),
  (3, 3, 'OX-L-BLUE',   4500,  0, TRUE),
  (4, 4, 'JEAN-32-IND', 6900, 12, TRUE),
  (5, 3, 'OX-XL-BLUE',  4500,  0, FALSE);   -- unavailable, NOT a fake zero-stock row

-- ASSETS
INSERT INTO assets (product_id, storage_key, role, alt_text, sort_order) VALUES
  (1, 'catalog/oxford/main.jpg', 'thumbnail', 'Oxford shirt front', 0),
  (1, 'catalog/oxford/side.jpg', 'gallery',   'Oxford shirt side',  1),
  (2, 'catalog/jeans/main.jpg',  'thumbnail', 'Jeans front',        0);

-- Reset sequences
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq',   (SELECT MAX(id) FROM products));
SELECT setval('variants_id_seq',   (SELECT MAX(id) FROM variants));
SELECT setval('skus_id_seq',       (SELECT MAX(id) FROM skus));

ALTER TABLE products ENABLE TRIGGER trg_published_product_has_sku;

COMMIT;