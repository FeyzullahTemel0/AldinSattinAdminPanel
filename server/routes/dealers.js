import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM dealers';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR company_name ILIKE $${params.length + 2} OR email ILIKE $${params.length + 3})`);
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
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM dealers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching dealer:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      name,
      company_name,
      email,
      phone,
      address,
      city,
      status = 'active'
    } = req.body;

    const result = await pool.query(
      `INSERT INTO dealers (name, company_name, email, phone, address, city, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, company_name, email, phone, address, city, status]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating dealer:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      company_name,
      email,
      phone,
      address,
      city,
      status,
      total_ads,
      total_sales,
      total_revenue,
      rating
    } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (company_name !== undefined) {
      fields.push(`company_name = $${paramCount++}`);
      values.push(company_name);
    }
    if (email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (total_ads !== undefined) {
      fields.push(`total_ads = $${paramCount++}`);
      values.push(total_ads);
    }
    if (total_sales !== undefined) {
      fields.push(`total_sales = $${paramCount++}`);
      values.push(total_sales);
    }
    if (total_revenue !== undefined) {
      fields.push(`total_revenue = $${paramCount++}`);
      values.push(total_revenue);
    }
    if (rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(rating);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE dealers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating dealer:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM dealers WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting dealer:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
