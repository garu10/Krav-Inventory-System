import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { withTransaction } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function runMigrations() {
  await ensureMigrationsTable();

  const files = (await fs.readdir(__dirname))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const { rows: executedRows } = await pool.query('SELECT filename FROM schema_migrations');
  const executedSet = new Set(executedRows.map((r) => r.filename));

  let appliedCount = 0;

  for (const file of files) {
    if (executedSet.has(file)) {
      console.log(`⏭️  Skipping already applied migration: ${file}`);
      continue;
    }

    const filePath = path.join(__dirname, file);
    const sql = await fs.readFile(filePath, 'utf-8');

    console.log(`🚀 Applying migration: ${file}...`);
    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    });
    console.log(`✅ Applied: ${file}`);
    appliedCount++;
  }

  if (appliedCount === 0) {
    console.log('✨ All migrations are already up to date.');
  } else {
    console.log(`🎉 Successfully applied ${appliedCount} migration(s).`);
  }
}

export async function resetDatabase() {
  console.log('⚠️  Resetting public schema...');
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  console.log('✅ Schema reset complete. Re-running migrations...');
  await runMigrations();
}

// CLI execution
if (process.argv[1] === __filename) {
  const command = process.argv[2] || 'up';
  (async () => {
    try {
      if (command === 'reset' || command === 'fresh') {
        await resetDatabase();
      } else {
        await runMigrations();
      }
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      await pool.end();
      process.exit(1);
    }
  })();
}

