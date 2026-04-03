import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { risk_level, search } = req.query;

    let query = `
      SELECT
        a.id,
        a.user_name,
        NULL::text AS user_email,
        'admin'::text AS user_type,
        a.action,
        NULL::text AS ip_address,
        NULL::text AS mac_address,
        NULL::text AS location_country,
        NULL::text AS location_city,
        NULL::text AS device_type,
        NULL::text AS device_os,
        NULL::text AS device_browser,
        a.created_at AS timestamp,
        CASE
          WHEN a.action ILIKE '%ban%' OR a.action ILIKE '%suspicious%' THEN 'high'
          WHEN a.action ILIKE '%error%' OR a.action ILIKE '%failed%' THEN 'medium'
          ELSE 'low'
        END AS risk_level,
        CASE
          WHEN a.action ILIKE '%ban%' OR a.action ILIKE '%suspicious%' THEN true
          ELSE false
        END AS is_suspicious
      FROM activities a
    `;

    const conditions = [];
    const params = [];

    if (risk_level && risk_level !== 'all') {
      conditions.push(`(
        CASE
          WHEN a.action ILIKE '%ban%' OR a.action ILIKE '%suspicious%' THEN 'high'
          WHEN a.action ILIKE '%error%' OR a.action ILIKE '%failed%' THEN 'medium'
          ELSE 'low'
        END
      ) = $${params.length + 1}`);
      params.push(risk_level);
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(`(a.user_name ILIKE $${params.length + 1} OR a.action ILIKE $${params.length + 2})`);
      params.push(pattern, pattern);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY a.created_at DESC LIMIT 500';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
