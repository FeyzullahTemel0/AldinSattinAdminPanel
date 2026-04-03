import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
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
import marketListingsRouter from './routes/market-listings.js';
import taxonomyRouter from './routes/taxonomy.js';
import securityLogsRouter from './routes/security-logs.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
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
app.use('/api/market-listings', marketListingsRouter);
app.use('/api/taxonomy', taxonomyRouter);
app.use('/api/security-logs', securityLogsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default app;
