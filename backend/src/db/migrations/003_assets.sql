CREATE TABLE assets (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  variant_id  INTEGER REFERENCES variants(id) ON DELETE CASCADE,
  storage_key VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'gallery'
              CHECK (role IN ('thumbnail','gallery','swatch')),
  alt_text    VARCHAR(255),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assets_owner_exactly_one CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL) OR
    (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

CREATE INDEX idx_assets_product ON assets(product_id);
CREATE INDEX idx_assets_variant ON assets(variant_id);