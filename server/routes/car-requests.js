import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM car_requests';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(customer_name ILIKE $${params.length + 1} OR vehicle_brand ILIKE $${params.length + 2} OR customer_email ILIKE $${params.length + 3})`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching car requests:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM car_requests WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car request not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching car request:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      vehicle_brand,
      vehicle_model,
      year_min,
      year_max,
      budget_min,
      budget_max,
      preferred_category,
      notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO car_requests (customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, year_min, year_max, budget_min, budget_max, preferred_category, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, year_min, year_max, budget_min, budget_max, preferred_category, notes]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating car request:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, offers_count, notes } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (offers_count !== undefined) {
      fields.push(`offers_count = $${paramCount++}`);
      values.push(offers_count);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE car_requests SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car request not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating car request:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM car_requests WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car request not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting car request:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
