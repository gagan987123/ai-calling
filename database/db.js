import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration constants
const DEFAULT_DB_PORT = 5432;
const DEFAULT_POOL_MAX = 20;
const DEFAULT_IDLE_TIMEOUT = 30000;
const DEFAULT_CONNECTION_TIMEOUT = 2000;
const QUERY_TIMEOUT = 5000;

// Check if DATABASE_URL is provided, otherwise use individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for configuration
  const dbUrl = new URL(process.env.DATABASE_URL);
  poolConfig = {
    host: dbUrl.hostname,
    port: dbUrl.port || DEFAULT_DB_PORT,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Remove leading slash
    max: DEFAULT_POOL_MAX,
    idleTimeoutMillis: DEFAULT_IDLE_TIMEOUT,
    connectionTimeoutMillis: DEFAULT_CONNECTION_TIMEOUT,
    ssl: dbUrl.searchParams.get('sslmode') === 'disable' ? false : {
      rejectUnauthorized: false
    }
  };
} else {
  // Use individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || DEFAULT_DB_PORT,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'heliumdb',
    max: DEFAULT_POOL_MAX,
    idleTimeoutMillis: DEFAULT_IDLE_TIMEOUT,
    connectionTimeoutMillis: DEFAULT_CONNECTION_TIMEOUT,
    ssl: process.env.DB_SSL === 'disable' ? false : {
      rejectUnauthorized: false
    }
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', err => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  const timeout = setTimeout(() => {
    console.error('⚠️ Client has been checked out for more than 5 seconds!');
  }, QUERY_TIMEOUT);

  client.query = (...args) => {
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

export default pool;
