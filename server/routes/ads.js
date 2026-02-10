import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM ads';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(title ILIKE $${params.length + 1} OR dealer_name ILIKE $${params.length + 2} OR brand ILIKE $${params.length + 3})`);
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
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ads WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, price, brand, model, year, category, dealer_id, dealer_name } = req.body;

    const result = await pool.query(
      `INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, price, brand, model, year, category, dealer_id, dealer_name]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, brand, model, year, category, status } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (brand !== undefined) {
      fields.push(`brand = $${paramCount++}`);
      values.push(brand);
    }
    if (model !== undefined) {
      fields.push(`model = $${paramCount++}`);
      values.push(model);
    }
    if (year !== undefined) {
      fields.push(`year = $${paramCount++}`);
      values.push(year);
    }
    if (category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE ads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ads WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
