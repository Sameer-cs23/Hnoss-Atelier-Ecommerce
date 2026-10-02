const router = require('express').Router();
const Product = require('../../models/product');
const Variant = require('../../models/variant');
const Sku     = require('../../models/sku');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

router.use(requireAuth, requireAdmin);

router.post('/', async (req, res, next) => {
  try {
    const { name, slug, category_id, description, status, specifications } = req.body || {};
    if (!name || !slug || !category_id)
      return res.status(422).json({ error: 'VALIDATION', message: 'name, slug, category_id required' });
    res.status(201).json(await Product.create({ name, slug, category_id, description, status, specifications }));
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const { category_id, status } = req.query;
    res.json(await Product.list({ category_id: category_id && Number(category_id), status }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.getById(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const p = await Product.update(Number(req.params.id), req.body || {});
    if (!p) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.post('/:id/variants', async (req, res, next) => {
  try {
    res.status(201).json(await Variant.create({
      product_id: Number(req.params.id),
      option_values: req.body?.option_values || {}
    }));
  } catch (e) { next(e); }
});

router.post('/variants/:variantId/skus', async (req, res, next) => {
  try {
    const { sku_code, price_minor, stock_quantity, active } = req.body || {};
    if (!sku_code || price_minor == null)
      return res.status(422).json({ error: 'VALIDATION', message: 'sku_code and price_minor required' });
    if (price_minor < 0)
      return res.status(422).json({ error: 'VALIDATION', message: 'price_minor cannot be negative' });
    res.status(201).json(await Sku.create({
      variant_id: Number(req.params.variantId),
      sku_code, price_minor, stock_quantity, active
    }));
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await require('../../db').query(
      'DELETE FROM products WHERE id=$1', [Number(req.params.id)]
    );
    if (!rowCount) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    res.status(204).send();
  } catch (e) { next(e); }
});
module.exports = router;