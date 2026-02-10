import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, category, start_date, end_date } = req.query;

    let query = 'SELECT * FROM finance_records';
    const params = [];
    const conditions = [];

    if (type && type !== 'all') {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }

    if (category && category !== 'all') {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching finance records:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT
        type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM finance_records
    `;
    const params = [];
    const conditions = [];

    if (start_date) {
      conditions.push(`date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY type';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const summaryQuery = `
      SELECT
        type,
        category,
        SUM(amount) as total_amount
      FROM finance_records
      WHERE date >= $1
      GROUP BY type, category
    `;
    const summaryResult = await pool.query(summaryQuery, [startDate]);

    const revenue = summaryResult.rows
      .filter(row => row.type === 'income')
      .reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);

    const expenses = {};
    summaryResult.rows
      .filter(row => row.type === 'expense')
      .forEach(row => {
        expenses[row.category] = parseFloat(row.total_amount || 0);
      });

    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);

    const settingsResult = await pool.query("SELECT key, value FROM settings WHERE key = 'tax_rate'");
    const taxRate = settingsResult.rows.length > 0 ? parseFloat(settingsResult.rows[0].value) : 18;

    const tax = (revenue * taxRate) / 100;
    const netProfit = revenue - tax - totalExpenses;

    res.json({
      data: {
        revenue,
        expenses,
        totalExpenses,
        taxRate,
        tax,
        netProfit,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching finance dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/monthly-trend', async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const query = `
      SELECT
        DATE_TRUNC('month', date) as month,
        type,
        SUM(amount) as total_amount
      FROM finance_records
      WHERE date >= $1
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    `;

    const result = await pool.query(query, [startDate]);

    const settingsResult = await pool.query("SELECT key, value FROM settings WHERE key = 'tax_rate'");
    const taxRate = settingsResult.rows.length > 0 ? parseFloat(settingsResult.rows[0].value) : 18;

    const monthlyData = {};
    result.rows.forEach(row => {
      const monthKey = new Date(row.month).toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expenses: 0 };
      }
      if (row.type === 'income') {
        monthlyData[monthKey].revenue += parseFloat(row.total_amount || 0);
      } else if (row.type === 'expense') {
        monthlyData[monthKey].expenses += parseFloat(row.total_amount || 0);
      }
    });

    const trend = Object.entries(monthlyData).map(([month, data]) => {
      const tax = (data.revenue * taxRate) / 100;
      const profit = data.revenue - tax - data.expenses;
      return {
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        tax,
        profit
      };
    });

    res.json({ data: trend });
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM finance_records WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finance record not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching finance record:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      description,
      reference_id,
      reference_type,
      date,
      created_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO finance_records (type, category, amount, description, reference_id, reference_type, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, category, amount, description, reference_id, reference_type, date || new Date(), created_by]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating finance record:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, date } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(type);
    }
    if (category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(amount);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(date);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE finance_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finance record not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating finance record:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM finance_records WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finance record not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting finance record:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
