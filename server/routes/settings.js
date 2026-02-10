import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM settings';
    const params = [];

    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY category, key';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      key,
      value,
      type = 'string',
      category,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO settings (key, value, type, category, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         type = EXCLUDED.type,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         updated_at = NOW()
       RETURNING *`,
      [key, value, type, category, description]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating/updating setting:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (value !== undefined) {
      fields.push(`value = $${paramCount++}`);
      values.push(value);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(key);

    const result = await pool.query(
      `UPDATE settings SET ${fields.join(', ')} WHERE key = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('DELETE FROM settings WHERE key = $1 RETURNING key', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
