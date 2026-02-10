import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { ad_id, dealer_id, status } = req.query;

    let query = 'SELECT * FROM payments';
    const params = [];
    const conditions = [];

    if (ad_id) {
      conditions.push(`ad_id = $${params.length + 1}`);
      params.push(ad_id);
    }

    if (dealer_id) {
      conditions.push(`dealer_id = $${params.length + 1}`);
      params.push(dealer_id);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ad_id, dealer_id, dealer_name, amount, payment_method, status = 'pending', duration_days = 30 } = req.body;

    const result = await pool.query(
      `INSERT INTO payments (ad_id, dealer_id, dealer_name, amount, payment_method, status, duration_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [ad_id, dealer_id, dealer_name, amount, payment_method, status, duration_days]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, amount } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (payment_method !== undefined) {
      fields.push(`payment_method = $${paramCount++}`);
      values.push(payment_method);
    }
    if (amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(amount);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
