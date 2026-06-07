require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const logger = require('../utils/logger');

async function migrate() {
  let client;
  try {
    client = await pool.connect();
    
    // Create migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const { rows } = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map(r => r.name));

    for (const file of files) {
      if (!executedMigrations.has(file)) {
        logger.info(`Executing migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          logger.info(`Successfully migrated: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          logger.error(`Error executing migration ${file}:`, err);
          throw err;
        }
      }
    }
    logger.info('All migrations completed successfully.');
  } catch (error) {
    logger.error('Migration failed', error);
    process.exit(1);
  } finally {
    if (client) client.release();
    pool.end();
  }
}

migrate();
