import dotenv from 'dotenv';

dotenv.config();

let initPromise;
let appPromise;

const ensureInitialized = async () => {
  const shouldRunDbInit = process.env.RUN_DB_INIT === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !shouldRunDbInit) {
    return;
  }

  if (!initPromise) {
    initPromise = import('../server/db-init.js')
      .then(({ initializeDatabase }) => initializeDatabase())
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

const getApp = async () => {
  if (!appPromise) {
    appPromise = import('../server/app.js').then((module) => module.default);
  }

  return appPromise;
};

export default async function handler(req, res) {
  try {
    await ensureInitialized();
    const app = await getApp();
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
