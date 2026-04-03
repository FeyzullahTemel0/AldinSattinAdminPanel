import express from 'express';
import pool from '../db.js';

const router = express.Router();

const getFirstId = async (client, tableName) => {
  const result = await client.query(`SELECT id FROM ${tableName} ORDER BY created_at ASC NULLS LAST LIMIT 1`);
  return result.rows[0]?.id || null;
};

router.get('/', async (req, res) => {
  try {
    const { status, seller_type, search } = req.query;

    let query = `
      SELECT
        vl.*,
        b.name AS brand_name,
        m.name AS model_name
      FROM vehicle_listings vl
      LEFT JOIN brands b ON b.id = vl.brand_id
      LEFT JOIN models m ON m.id = vl.model_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push(`vl.status = $${params.length + 1}`);
      params.push(status);
    }

    if (seller_type && seller_type !== 'all') {
      conditions.push(`vl.seller_type = $${params.length + 1}`);
      params.push(seller_type);
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(`(
        vl.title ILIKE $${params.length + 1}
        OR b.name ILIKE $${params.length + 2}
        OR m.name ILIKE $${params.length + 3}
      )`);
      params.push(pattern, pattern, pattern);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY vl.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching market listings:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/meta', async (req, res) => {
  try {
    const [brands, models, profiles, dealers, statuses] = await Promise.all([
      pool.query('SELECT id, name FROM brands ORDER BY name ASC LIMIT 200'),
      pool.query('SELECT id, name, brand_id FROM models ORDER BY name ASC LIMIT 500'),
      pool.query('SELECT id, full_name, email FROM user_profiles ORDER BY created_at DESC LIMIT 200'),
      pool.query('SELECT id, business_name FROM dealer_businesses ORDER BY created_at DESC LIMIT 200'),
      pool.query('SELECT DISTINCT status FROM vehicle_listings WHERE status IS NOT NULL ORDER BY status ASC'),
    ]);

    res.json({
      data: {
        brands: brands.rows,
        models: models.rows,
        user_profiles: profiles.rows,
        dealer_businesses: dealers.rows,
        statuses: statuses.rows.map((row) => row.status),
      },
    });
  } catch (error) {
    console.error('Error fetching market listing metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payload = req.body || {};
    const sellerType = payload.seller_type || 'individual';

    const brandId = payload.brand_id || (await getFirstId(client, 'brands'));
    const modelId = payload.model_id || (await getFirstId(client, 'models'));
    const createdById = payload.created_by_user_id || (await getFirstId(client, 'user_profiles'));

    let sellerId = payload.seller_id;
    if (!sellerId) {
      sellerId = sellerType === 'dealer'
        ? await getFirstId(client, 'dealer_businesses')
        : await getFirstId(client, 'user_profiles');
    }

    if (!brandId || !modelId || !createdById || !sellerId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Create failed: required seed records missing (brands/models/user_profiles/dealer_businesses).',
      });
    }

    const nowYear = new Date().getFullYear();

    const result = await client.query(
      `
        INSERT INTO vehicle_listings (
          seller_type,
          seller_id,
          created_by_user_id,
          brand_id,
          model_id,
          year,
          price,
          mileage,
          fuel_type,
          transmission,
          body_type,
          color,
          title,
          description,
          city,
          district,
          neighborhood,
          status,
          damage_record,
          trade_option,
          series_id,
          package_id,
          engine_power_hp,
          engine_volume_cc,
          drive_type,
          warranty_status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26
        )
        RETURNING *
      `,
      [
        sellerType,
        sellerId,
        createdById,
        brandId,
        modelId,
        Number(payload.year) || nowYear,
        Number(payload.price) || 0,
        Number(payload.mileage) || 0,
        payload.fuel_type || 'benzin',
        payload.transmission || 'automatic',
        payload.body_type || 'sedan',
        payload.color || 'siyah',
        payload.title || 'Yeni Arac Ilani',
        payload.description || '',
        payload.city || '',
        payload.district || '',
        payload.neighborhood || '',
        payload.status || 'active',
        Boolean(payload.damage_record),
        Boolean(payload.trade_option),
        payload.series_id || null,
        payload.package_id || null,
        payload.engine_power_hp || null,
        payload.engine_volume_cc || null,
        payload.drive_type || null,
        payload.warranty_status || null,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating market listing:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const allowedFields = [
      'title',
      'description',
      'price',
      'mileage',
      'fuel_type',
      'transmission',
      'body_type',
      'color',
      'city',
      'district',
      'neighborhood',
      'status',
      'trade_option',
      'damage_record',
      'year',
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        fields.push(`${field} = $${values.length + 1}`);
        values.push(payload[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE vehicle_listings
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating market listing:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vehicle_listings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting market listing:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
