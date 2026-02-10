import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { platform, status, ad_id } = req.query;

    let query = 'SELECT * FROM social_media_posts';
    const params = [];
    const conditions = [];

    if (platform && platform !== 'all') {
      conditions.push(`platform = $${params.length + 1}`);
      params.push(platform);
    }

    if (status && status !== 'all') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (ad_id) {
      conditions.push(`ad_id = $${params.length + 1}`);
      params.push(ad_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM social_media_posts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social media post not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching social media post:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      platform,
      ad_id,
      post_title,
      post_content,
      post_url,
      status = 'draft',
      scheduled_at
    } = req.body;

    const result = await pool.query(
      `INSERT INTO social_media_posts (platform, ad_id, post_title, post_content, post_url, status, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [platform, ad_id, post_title, post_content, post_url, status, scheduled_at]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating social media post:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      post_title,
      post_content,
      post_url,
      status,
      scheduled_at,
      published_at,
      views,
      likes,
      shares
    } = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (post_title !== undefined) {
      fields.push(`post_title = $${paramCount++}`);
      values.push(post_title);
    }
    if (post_content !== undefined) {
      fields.push(`post_content = $${paramCount++}`);
      values.push(post_content);
    }
    if (post_url !== undefined) {
      fields.push(`post_url = $${paramCount++}`);
      values.push(post_url);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (scheduled_at !== undefined) {
      fields.push(`scheduled_at = $${paramCount++}`);
      values.push(scheduled_at);
    }
    if (published_at !== undefined) {
      fields.push(`published_at = $${paramCount++}`);
      values.push(published_at);
    }
    if (views !== undefined) {
      fields.push(`views = $${paramCount++}`);
      values.push(views);
    }
    if (likes !== undefined) {
      fields.push(`likes = $${paramCount++}`);
      values.push(likes);
    }
    if (shares !== undefined) {
      fields.push(`shares = $${paramCount++}`);
      values.push(shares);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE social_media_posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social media post not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating social media post:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM social_media_posts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social media post not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting social media post:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
