-- PRODUCTS
CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(150) UNIQUE NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','published','archived')),
  specifications  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

-- VARIANTS
CREATE TABLE variants (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_values   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variants_product ON variants(product_id);

-- SKUS
CREATE TABLE skus (
  id                SERIAL PRIMARY KEY,
  variant_id        INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  sku_code          VARCHAR(64) UNIQUE NOT NULL,
  price_minor       BIGINT NOT NULL CHECK (price_minor >= 0),
  stock_quantity    INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT skus_code_format CHECK (sku_code ~ '^[A-Z0-9\-]+$')
);

CREATE INDEX idx_skus_variant ON skus(variant_id);
CREATE INDEX idx_skus_active ON skus(active) WHERE active = TRUE;

-- BUSINESS RULE: published product must have ≥1 active SKU
CREATE OR REPLACE FUNCTION enforce_published_product_has_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF NOT EXISTS (
      SELECT 1 FROM variants v
      JOIN skus s ON s.variant_id = v.id
      WHERE v.product_id = NEW.id AND s.active = TRUE
    ) THEN
      RAISE EXCEPTION 'Published product % must have at least one active SKU', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_published_product_has_sku
BEFORE INSERT OR UPDATE OF status ON products
FOR EACH ROW EXECUTE FUNCTION enforce_published_product_has_sku();