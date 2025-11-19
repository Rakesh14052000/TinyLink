const { Pool } = require('pg');
require('dotenv').config();

async function ensureDatabaseAndTable() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0,
        lastClicked TIMESTAMP,
        createdAt TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log(`Table "links" is created`);

    return pool;
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

module.exports = { ensureDatabaseAndTable };
