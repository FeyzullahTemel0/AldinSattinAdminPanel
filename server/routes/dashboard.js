import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    const adsCount = await pool.query('SELECT COUNT(*) as count FROM ads');
    stats.totalAds = parseInt(adsCount.rows[0].count);

    const adsThisMonth = await pool.query(
      "SELECT COUNT(*) as count FROM ads WHERE created_at >= date_trunc('month', CURRENT_DATE)"
    );
    const adsLastMonth = await pool.query(
      `SELECT COUNT(*) as count FROM ads
       WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
       AND created_at < date_trunc('month', CURRENT_DATE)`
    );
    const adsThisMonthCount = parseInt(adsThisMonth.rows[0].count);
    const adsLastMonthCount = parseInt(adsLastMonth.rows[0].count);
    stats.totalAdsChange = adsLastMonthCount > 0
      ? Math.round(((adsThisMonthCount - adsLastMonthCount) / adsLastMonthCount) * 100 * 10) / 10
      : 0;

    const activeAdsCount = await pool.query("SELECT COUNT(*) as count FROM ads WHERE status = 'active'");
    stats.activeAds = parseInt(activeAdsCount.rows[0].count);

    const dealersCount = await pool.query("SELECT COUNT(*) as count FROM dealers WHERE status = 'active'");
    stats.activeDealers = parseInt(dealersCount.rows[0].count);

    const dealersLastMonth = await pool.query(
      `SELECT COUNT(*) as count FROM dealers
       WHERE status = 'active'
       AND created_at < date_trunc('month', CURRENT_DATE)`
    );
    const dealersLastMonthCount = parseInt(dealersLastMonth.rows[0].count);
    stats.activeDealersChange = dealersLastMonthCount > 0
      ? Math.round(((stats.activeDealers - dealersLastMonthCount) / dealersLastMonthCount) * 100 * 10) / 10
      : 0;

    const requestsCount = await pool.query('SELECT COUNT(*) as count FROM car_requests');
    stats.carRequests = parseInt(requestsCount.rows[0].count);

    const requestsThisMonth = await pool.query(
      "SELECT COUNT(*) as count FROM car_requests WHERE created_at >= date_trunc('month', CURRENT_DATE)"
    );
    const requestsLastMonth = await pool.query(
      `SELECT COUNT(*) as count FROM car_requests
       WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
       AND created_at < date_trunc('month', CURRENT_DATE)`
    );
    const requestsThisMonthCount = parseInt(requestsThisMonth.rows[0].count);
    const requestsLastMonthCount = parseInt(requestsLastMonth.rows[0].count);
    stats.carRequestsChange = requestsLastMonthCount > 0
      ? Math.round(((requestsThisMonthCount - requestsLastMonthCount) / requestsLastMonthCount) * 100 * 10) / 10
      : 0;

    const monthlyRevenue = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM finance_records WHERE type = 'income' AND date >= date_trunc('month', CURRENT_DATE)"
    );
    stats.monthlyRevenue = parseFloat(monthlyRevenue.rows[0].total);

    const lastMonthRevenue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM finance_records
       WHERE type = 'income'
       AND date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
       AND date < date_trunc('month', CURRENT_DATE)`
    );
    const lastMonthRevenueAmount = parseFloat(lastMonthRevenue.rows[0].total);
    stats.monthlyRevenueChange = lastMonthRevenueAmount > 0
      ? Math.round(((stats.monthlyRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100 * 10) / 10
      : 0;

    const pendingAds = await pool.query("SELECT COUNT(*) as count FROM ads WHERE status = 'pending_payment'");
    stats.pendingAds = parseInt(pendingAds.rows[0].count);

    const todayPublished = await pool.query(
      "SELECT COUNT(*) as count FROM ads WHERE status = 'active' AND DATE(created_at) = CURRENT_DATE"
    );
    stats.todayPublished = parseInt(todayPublished.rows[0].count);

    stats.activeUsers = 0;
    stats.reportedAds = 0;

    res.json({ data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-ads', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await pool.query(
      'SELECT * FROM ads ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching recent ads:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-requests', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const result = await pool.query(
      'SELECT * FROM car_requests ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching recent car requests:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-dealers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const result = await pool.query(
      `SELECT * FROM dealers
       WHERE status = 'active'
       ORDER BY total_revenue DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching top dealers:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/category-distribution', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         category,
         COUNT(*) as count,
         ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 1) as percentage
       FROM ads
       WHERE status = 'active'
       GROUP BY category
       ORDER BY count DESC`
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      'SELECT * FROM activities ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/activities', async (req, res) => {
  try {
    const { user_id, user_name, action, item, type = 'info' } = req.body;

    const result = await pool.query(
      `INSERT INTO activities (user_id, user_name, action, item, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, user_name, action, item, type]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
