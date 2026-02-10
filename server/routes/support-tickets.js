import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;

    let query = 'SELECT * FROM support_tickets';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (priority && priority !== 'all') {
      conditions.push(`priority = $${params.length + 1}`);
      params.push(priority);
    }

    if (category && category !== 'all') {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(subject ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2} OR ticket_number ILIKE $${params.length + 3})`);
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
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      subject,
      description,
      user_id,
      user_name,
      user_email,
      priority = 'medium',
      category
    } = req.body;

    const result = await pool.query(
      `INSERT INTO support_tickets (subject, description, user_id, user_name, user_email, priority, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [subject, description, user_id, user_name, user_email, priority, category]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      assigned_to,
      resolved_at
    } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (assigned_to !== undefined) {
      fields.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }
    if (resolved_at !== undefined) {
      fields.push(`resolved_at = $${paramCount++}`);
      values.push(resolved_at);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE support_tickets SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM support_tickets WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
