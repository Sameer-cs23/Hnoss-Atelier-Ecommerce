const fs = require('fs');
const path = require('path');
const db = require('./index');

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const dir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const { rows } = await db.query('SELECT 1 FROM _migrations WHERE filename=$1', [file]);
      if (rows.length) { console.log(`skip ${file}`); continue; }
      console.log(`apply ${file}`);
      await db.query('BEGIN');
      try {
        await db.query(fs.readFileSync(path.join(dir, file), 'utf8'));
        await db.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await db.query('COMMIT');
      } catch (e) {
        await db.query('ROLLBACK');
        throw e;
      }
    }
    console.log('migrations complete');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();