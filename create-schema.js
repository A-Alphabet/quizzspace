const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres.ekftxoqdedcfzpefoikj',
  password: 'ISjQYTgNKtD4l2lc',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSchema() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync('./schema.sql', 'utf-8');
    console.log('Running schema creation...');
    await client.query(sql);
    console.log('✅ Schema created successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema();
