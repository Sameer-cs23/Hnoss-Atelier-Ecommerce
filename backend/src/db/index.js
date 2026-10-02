const { Pool } = require('pg');
require('dotenv').config();

const url = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: url });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};