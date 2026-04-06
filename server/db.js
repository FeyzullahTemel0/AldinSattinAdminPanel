import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from both project root and server folder for local/dev consistency.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pg;

const requiredEnvKeys = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (missingEnvKeys.length > 0) {
  throw new Error(`Missing required database environment variables: ${missingEnvKeys.join(', ')}`);
}

const isProduction = process.env.NODE_ENV === 'production';
const dbSslEnabled = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : isProduction;
const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: dbSslEnabled
    ? {
        rejectUnauthorized: dbSslRejectUnauthorized,
      }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
