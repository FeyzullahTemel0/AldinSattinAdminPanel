import dotenv from 'dotenv';
import app from '../server/app.js';
import { initializeDatabase } from '../server/db-init.js';

dotenv.config();

let initPromise;

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = initializeDatabase()
      .then(() => {
        console.log('Database initialization completed');
      })
      .catch((error) => {
        initPromise = null;
        throw error;
      });
  }

  await initPromise;
};

export default async function handler(req, res) {
  try {
    await ensureInitialized();
    return app(req, res);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    const payload = { error: 'Server initialization failed' };

    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_INIT_ERRORS === 'true') {
      payload.details = error.message;
    }

    return res.status(500).json(payload);
  }
}
