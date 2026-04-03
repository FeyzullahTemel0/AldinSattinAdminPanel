import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [brandsResult, seriesResult, modelsResult, packagesResult, subpackagesResult] = await Promise.all([
      pool.query('SELECT id, name, logo_url, created_at FROM brands ORDER BY name ASC'),
      pool.query('SELECT id, brand_id, name, year_start, year_end, created_at FROM vehicle_series ORDER BY name ASC'),
      pool.query('SELECT id, brand_id, series_id, name, year_start, year_end, created_at FROM models ORDER BY name ASC'),
      pool.query('SELECT id, model_id, name, created_at FROM vehicle_packages ORDER BY name ASC'),
      pool.query('SELECT id, package_id, name, created_at FROM vehicle_subpackages ORDER BY name ASC'),
    ]);

    const brands = brandsResult.rows.map((brand) => ({
      ...brand,
      series: [],
      models_without_series: [],
    }));

    const brandMap = new Map(brands.map((b) => [b.id, b]));

    for (const series of seriesResult.rows) {
      const brand = brandMap.get(series.brand_id);
      if (!brand) continue;
      brand.series.push({ ...series, models: [] });
    }

    const seriesMap = new Map();
    for (const brand of brands) {
      for (const series of brand.series) {
        seriesMap.set(series.id, series);
      }
    }

    const modelMap = new Map();
    for (const model of modelsResult.rows) {
      const enrichedModel = { ...model, packages: [] };
      modelMap.set(model.id, enrichedModel);

      if (model.series_id && seriesMap.has(model.series_id)) {
        seriesMap.get(model.series_id).models.push(enrichedModel);
        continue;
      }

      const brand = brandMap.get(model.brand_id);
      if (brand) {
        brand.models_without_series.push(enrichedModel);
      }
    }

    const packageMap = new Map();
    for (const pkg of packagesResult.rows) {
      const enrichedPackage = { ...pkg, subpackages: [] };
      packageMap.set(pkg.id, enrichedPackage);
      const model = modelMap.get(pkg.model_id);
      if (model) {
        model.packages.push(enrichedPackage);
      }
    }

    for (const subpkg of subpackagesResult.rows) {
      const parentPackage = packageMap.get(subpkg.package_id);
      if (parentPackage) {
        parentPackage.subpackages.push(subpkg);
      }
    }

    res.json({
      data: {
        brands,
        counts: {
          brands: brandsResult.rows.length,
          series: seriesResult.rows.length,
          models: modelsResult.rows.length,
          packages: packagesResult.rows.length,
          subpackages: subpackagesResult.rows.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/brands', async (req, res) => {
  try {
    const { name, logo_url } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    const existing = await pool.query('SELECT id, name FROM brands WHERE LOWER(name) = LOWER($1) LIMIT 1', [name.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Brand already exists', data: existing.rows[0] });
    }

    const result = await pool.query(
      'INSERT INTO brands (name, logo_url) VALUES ($1, $2) RETURNING id, name, logo_url, created_at',
      [name.trim(), logo_url || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/series', async (req, res) => {
  try {
    const { brand_id, name, year_start, year_end } = req.body;
    if (!brand_id || !name || !name.trim()) {
      return res.status(400).json({ error: 'brand_id and name are required' });
    }

    const existing = await pool.query(
      'SELECT id, brand_id, name FROM vehicle_series WHERE brand_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
      [brand_id, name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Series already exists for this brand', data: existing.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO vehicle_series (brand_id, name, year_start, year_end)
       VALUES ($1, $2, $3, $4)
       RETURNING id, brand_id, name, year_start, year_end, created_at`,
      [brand_id, name.trim(), year_start || null, year_end || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/models', async (req, res) => {
  try {
    const { brand_id, series_id, name, year_start, year_end } = req.body;
    if (!brand_id || !name || !name.trim()) {
      return res.status(400).json({ error: 'brand_id and name are required' });
    }

    const existing = await pool.query(
      `SELECT id, brand_id, series_id, name
       FROM models
       WHERE brand_id = $1
         AND COALESCE(series_id::text, '') = COALESCE($2::text, '')
         AND LOWER(name) = LOWER($3)
       LIMIT 1`,
      [brand_id, series_id || null, name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Model already exists for selected brand and series', data: existing.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO models (brand_id, series_id, name, year_start, year_end)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, brand_id, series_id, name, year_start, year_end, created_at`,
      [brand_id, series_id || null, name.trim(), year_start || null, year_end || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating model:', error);
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Model already exists for selected brand and series' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/packages', async (req, res) => {
  try {
    const { model_id, name } = req.body;
    if (!model_id || !name || !name.trim()) {
      return res.status(400).json({ error: 'model_id and name are required' });
    }

    const existing = await pool.query(
      'SELECT id, model_id, name FROM vehicle_packages WHERE model_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
      [model_id, name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Package already exists for this model', data: existing.rows[0] });
    }

    const result = await pool.query(
      'INSERT INTO vehicle_packages (model_id, name) VALUES ($1, $2) RETURNING id, model_id, name, created_at',
      [model_id, name.trim()]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/subpackages', async (req, res) => {
  try {
    const { package_id, name } = req.body;
    if (!package_id || !name || !name.trim()) {
      return res.status(400).json({ error: 'package_id and name are required' });
    }

    const existing = await pool.query(
      'SELECT id, package_id, name FROM vehicle_subpackages WHERE package_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
      [package_id, name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Subpackage already exists for this package', data: existing.rows[0] });
    }

    const result = await pool.query(
      'INSERT INTO vehicle_subpackages (package_id, name) VALUES ($1, $2) RETURNING id, package_id, name, created_at',
      [package_id, name.trim()]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creating subpackage:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/subpackages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM vehicle_subpackages WHERE id = $1 RETURNING id, package_id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subpackage not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting subpackage:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM vehicle_packages WHERE id = $1 RETURNING id, model_id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const packageCount = await pool.query('SELECT COUNT(*)::int AS count FROM vehicle_packages WHERE model_id = $1', [id]);
    if (packageCount.rows[0].count > 0) {
      return res.status(409).json({
        error: 'Model has packages. Delete packages first.',
        data: { package_count: packageCount.rows[0].count },
      });
    }

    const result = await pool.query(
      'DELETE FROM models WHERE id = $1 RETURNING id, brand_id, series_id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting model:', error);
    if (error?.code === '23503') {
      return res.status(409).json({ error: 'Model cannot be deleted due to related records' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const modelCount = await pool.query('SELECT COUNT(*)::int AS count FROM models WHERE series_id = $1', [id]);
    if (modelCount.rows[0].count > 0) {
      return res.status(409).json({
        error: 'Series has models. Delete models first.',
        data: { model_count: modelCount.rows[0].count },
      });
    }

    const result = await pool.query(
      'DELETE FROM vehicle_series WHERE id = $1 RETURNING id, brand_id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting series:', error);
    if (error?.code === '23503') {
      return res.status(409).json({ error: 'Series cannot be deleted due to related records' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/brands/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const brandResult = await client.query(
      'SELECT id, name FROM brands WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (brandResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Brand not found' });
    }

    await client.query(
      `DELETE FROM vehicle_requests vr
       WHERE vr.brand_id = $1
          OR EXISTS (SELECT 1 FROM vehicle_series s WHERE s.id = vr.series_id AND s.brand_id = $1)
          OR EXISTS (SELECT 1 FROM models m WHERE m.id = vr.model_id AND m.brand_id = $1)`,
      [id]
    );

    await client.query(
      `DELETE FROM vehicle_listings vl
       WHERE vl.brand_id = $1
          OR EXISTS (SELECT 1 FROM vehicle_series s WHERE s.id = vl.series_id AND s.brand_id = $1)
          OR EXISTS (SELECT 1 FROM models m WHERE m.id = vl.model_id AND m.brand_id = $1)
          OR EXISTS (
            SELECT 1
            FROM vehicle_packages vp
            JOIN models m ON m.id = vp.model_id
            WHERE vp.id = vl.package_id
              AND m.brand_id = $1
          )`,
      [id]
    );

    await client.query(
      `DELETE FROM vehicle_packages vp
       USING models m
       WHERE vp.model_id = m.id
         AND m.brand_id = $1`,
      [id]
    );

    await client.query('DELETE FROM models WHERE brand_id = $1', [id]);
    await client.query('DELETE FROM vehicle_series WHERE brand_id = $1', [id]);
    await client.query('DELETE FROM brands WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      data: {
        id: brandResult.rows[0].id,
        name: brandResult.rows[0].name,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting brand:', error);
    if (error?.code === '23503') {
      return res.status(409).json({ error: 'Brand cannot be deleted due to related records' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
