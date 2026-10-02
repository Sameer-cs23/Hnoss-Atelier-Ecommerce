const router = require('express').Router();
const Category = require('../../models/category');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

router.use(requireAuth, requireAdmin);

router.post('/', async (req, res, next) => {
  try {
    const { name, slug, parent_id = null, active = true } = req.body || {};
    if (!name || !slug)
      return res.status(422).json({ error: 'VALIDATION', message: 'name and slug required' });
    res.status(201).json(await Category.create({ name, slug, parent_id, active }));
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try { res.json(await Category.listTree()); } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const cat = await Category.update(Number(req.params.id), req.body || {});
    if (!cat) return res.status(404).json({ error: 'NOT_FOUND', message: 'Category not found' });
    res.json(cat);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await require('../../db').query(
      'DELETE FROM categories WHERE id=$1', [Number(req.params.id)]
    );
    if (!rowCount) return res.status(404).json({ error: 'NOT_FOUND', message: 'Category not found' });
    res.status(204).send();
  } catch (e) { next(e); }
});
module.exports = router;