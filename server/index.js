import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adsRouter from './routes/ads.js';
import paymentsRouter from './routes/payments.js';
import carRequestsRouter from './routes/car-requests.js';
import dealersRouter from './routes/dealers.js';
import usersRouter from './routes/users.js';
import financeRouter from './routes/finance.js';
import socialMediaRouter from './routes/social-media.js';
import supportTicketsRouter from './routes/support-tickets.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/ads', adsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/car-requests', carRequestsRouter);
app.use('/api/dealers', dealersRouter);
app.use('/api/users', usersRouter);
app.use('/api/finance', financeRouter);
app.use('/api/social-media', socialMediaRouter);
app.use('/api/support-tickets', supportTicketsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
