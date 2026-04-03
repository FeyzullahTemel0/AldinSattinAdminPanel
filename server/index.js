import dotenv from 'dotenv';
import app from './app.js';
import { initializeDatabase } from './db-init.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialization completed');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
