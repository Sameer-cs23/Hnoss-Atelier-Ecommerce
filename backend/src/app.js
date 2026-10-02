require('dotenv').config();
const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.use('/api/v1/admin/categories', require('./routes/admin/categories'));
app.use('/api/v1/admin/products',   require('./routes/admin/products'));
app.use('/api/v1/admin/skus',       require('./routes/admin/skus'));

app.use(errorHandler);

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on :${port}`));
}

module.exports = app;