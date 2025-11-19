const { Pool, Client } = require('pg');
require('dotenv').config();


async function ensureDatabaseAndTable() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL.replace(process.env.DATABASE_NAME, 'postgres'),
    });
    await client.connect();

    const dbExists = await client.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [process.env.DATABASE_NAME]);
    if (dbExists.rowCount === 0) {
      await client.query(`CREATE DATABASE ${process.env.DATABASE_NAME}`);
      console.log(`Database "${process.env.DATABASE_NAME}" created`);
    }
    await client.end();

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${process.env.TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0,
        lastClicked TIMESTAMP,
        createdAt TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log(`Table "${process.env.TABLE_NAME}" is created`);
    return pool;
  } catch (err) {
    console.error('DB  Error:', err);
    process.exit(1);
  }
}

module.exports = { ensureDatabaseAndTable };
