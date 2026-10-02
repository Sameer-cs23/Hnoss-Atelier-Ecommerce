const router = require('express').Router();
const Sku = require('../../models/sku');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

router.use(requireAuth, requireAdmin);

router.patch('/:id', async (req, res, next) => {
  try {
    const { price_minor, stock_quantity, active } = req.body || {};
    if (stock_quantity != null && stock_quantity < 0)
      return res.status(422).json({ error: 'VALIDATION', message: 'stock_quantity cannot be negative' });
    if (price_minor != null && price_minor < 0)
      return res.status(422).json({ error: 'VALIDATION', message: 'price_minor cannot be negative' });
    const patch = {};
if (price_minor !== undefined) patch.price_minor = price_minor;
if (stock_quantity !== undefined) patch.stock_quantity = stock_quantity;
if (active !== undefined) patch.active = active;
const s = await Sku.update(Number(req.params.id), patch);
    if (!s) return res.status(404).json({ error: 'NOT_FOUND', message: 'SKU not found' });
    res.json(s);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await require('../../db').query(
      'DELETE FROM skus WHERE id=$1', [Number(req.params.id)]
    );
    if (!rowCount) return res.status(404).json({ error: 'NOT_FOUND', message: 'SKU not found' });
    res.status(204).send();
  } catch (e) { next(e); }
});
module.exports = router;