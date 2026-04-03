import pool from './db.js';

const initializationStatements = [
  `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `,
  `
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      avatar_url TEXT,
      role TEXT DEFAULT 'admin',
      status TEXT DEFAULT 'active',
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'customer',
      status TEXT DEFAULT 'active',
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS dealers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      company_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      total_ads INTEGER DEFAULT 0,
      active_ads INTEGER DEFAULT 0,
      total_sales INTEGER DEFAULT 0,
      total_revenue NUMERIC DEFAULT 0,
      rating NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS ads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL,
      dealer_id UUID,
      dealer_name TEXT,
      status TEXT DEFAULT 'pending_payment',
      payment_status TEXT DEFAULT 'unpaid',
      expiry_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ad_id UUID,
      dealer_id UUID,
      dealer_name TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      payment_date TIMESTAMPTZ DEFAULT now(),
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      duration_days INTEGER DEFAULT 30,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS car_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      vehicle_brand TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      year_min INTEGER,
      year_max INTEGER,
      budget_min NUMERIC DEFAULT 0,
      budget_max NUMERIC DEFAULT 0,
      preferred_category TEXT,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'new',
      offers_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS support_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number TEXT UNIQUE DEFAULT ('TKT-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      user_id UUID,
      user_name TEXT,
      user_email TEXT,
      priority TEXT DEFAULT 'medium',
      category TEXT,
      status TEXT DEFAULT 'new',
      assigned_to TEXT,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS finance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      description TEXT,
      reference_id UUID,
      reference_type TEXT,
      date TIMESTAMPTZ DEFAULT now(),
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string',
      category TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS social_media_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform TEXT NOT NULL,
      ad_id UUID,
      post_title TEXT NOT NULL,
      post_content TEXT,
      post_url TEXT,
      status TEXT DEFAULT 'draft',
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      item TEXT DEFAULT '',
      type TEXT DEFAULT 'info',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS vehicle_subpackages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      package_id UUID NOT NULL REFERENCES vehicle_packages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (package_id, name)
    );
  `,
  `
    ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'string';
  `,
  `
    INSERT INTO admins (username, email, password, first_name, last_name, role, status)
    VALUES ('admin', 'admin@aldinsattin.com', 'admin123', 'Admin', 'User', 'super_admin', 'active')
    ON CONFLICT (username) DO NOTHING;
  `,
  `
    INSERT INTO settings (key, value, type, category, description)
    VALUES ('tax_rate', '18', 'number', 'finance', 'Varsayilan KDV orani')
    ON CONFLICT (key) DO NOTHING;
  `,
  `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_profiles') THEN
        INSERT INTO users (name, email, phone, role, status, created_at, updated_at)
        SELECT
          COALESCE(up.full_name, split_part(up.email, '@', 1)) AS name,
          up.email,
          COALESCE(up.phone, '') AS phone,
          CASE WHEN up.user_type = 'dealer' THEN 'dealer' ELSE 'customer' END AS role,
          'active' AS status,
          COALESCE(up.created_at, NOW()) AS created_at,
          COALESCE(up.updated_at, COALESCE(up.created_at, NOW())) AS updated_at
        FROM user_profiles up
        WHERE up.email IS NOT NULL
        ON CONFLICT (email) DO UPDATE
        SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          updated_at = NOW();
      END IF;
    END $$;
  `,
  `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='dealer_businesses')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_profiles') THEN
        INSERT INTO dealers (
          name,
          company_name,
          email,
          phone,
          address,
          city,
          status,
          total_ads,
          active_ads,
          total_sales,
          total_revenue,
          rating,
          created_at,
          updated_at
        )
        SELECT
          COALESCE(up.full_name, db.business_name) AS name,
          db.business_name AS company_name,
          up.email,
          COALESCE(db.phone, '') AS phone,
          COALESCE(db.address, '') AS address,
          COALESCE(db.city, '') AS city,
          'active' AS status,
          COALESCE(stats.total_ads, 0) AS total_ads,
          COALESCE(stats.active_ads, 0) AS active_ads,
          0 AS total_sales,
          0 AS total_revenue,
          0 AS rating,
          COALESCE(db.created_at, NOW()) AS created_at,
          COALESCE(db.updated_at, COALESCE(db.created_at, NOW())) AS updated_at
        FROM dealer_businesses db
        LEFT JOIN user_profiles up ON up.id = db.user_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_ads,
            COUNT(*) FILTER (WHERE status = 'active') AS active_ads
          FROM vehicle_listings vl
          WHERE vl.seller_type = 'dealer' AND vl.seller_id = db.id
        ) stats ON TRUE
        WHERE up.email IS NOT NULL
        ON CONFLICT (email) DO UPDATE
        SET
          name = EXCLUDED.name,
          company_name = EXCLUDED.company_name,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          status = EXCLUDED.status,
          total_ads = EXCLUDED.total_ads,
          active_ads = EXCLUDED.active_ads,
          updated_at = NOW();
      END IF;
    END $$;
  `,
  `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vehicle_listings')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='brands')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='models') THEN
        INSERT INTO ads (
          title,
          description,
          price,
          brand,
          model,
          year,
          category,
          dealer_id,
          dealer_name,
          status,
          payment_status,
          expiry_date,
          created_at,
          updated_at
        )
        SELECT
          COALESCE(vl.title, CONCAT(b.name, ' ', m.name, ' ', vl.year)) AS title,
          COALESCE(vl.description, '') AS description,
          COALESCE(vl.price, 0) AS price,
          COALESCE(b.name, 'Bilinmiyor') AS brand,
          COALESCE(m.name, 'Bilinmiyor') AS model,
          COALESCE(vl.year, EXTRACT(YEAR FROM NOW())::INT) AS year,
          'market' AS category,
          vl.seller_id AS dealer_id,
          COALESCE(db.business_name, up.full_name, 'Bireysel Satici') AS dealer_name,
          CASE WHEN vl.status = 'active' THEN 'active' ELSE 'pending_payment' END AS status,
          CASE WHEN vl.status = 'active' THEN 'paid' ELSE 'unpaid' END AS payment_status,
          NOW() + INTERVAL '30 days' AS expiry_date,
          COALESCE(vl.created_at, NOW()) AS created_at,
          COALESCE(vl.updated_at, COALESCE(vl.created_at, NOW())) AS updated_at
        FROM vehicle_listings vl
        LEFT JOIN brands b ON b.id = vl.brand_id
        LEFT JOIN models m ON m.id = vl.model_id
        LEFT JOIN dealer_businesses db ON db.id = vl.seller_id AND vl.seller_type = 'dealer'
        LEFT JOIN user_profiles up ON up.id = vl.seller_id AND vl.seller_type = 'individual'
        WHERE NOT EXISTS (
          SELECT 1
          FROM ads a
          WHERE a.title = COALESCE(vl.title, CONCAT(b.name, ' ', m.name, ' ', vl.year))
            AND a.brand = COALESCE(b.name, 'Bilinmiyor')
            AND a.model = COALESCE(m.name, 'Bilinmiyor')
            AND a.year = COALESCE(vl.year, EXTRACT(YEAR FROM NOW())::INT)
            AND a.price = COALESCE(vl.price, 0)
        );
      END IF;
    END $$;
  `,
  `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='vehicle_requests') THEN
        INSERT INTO car_requests (
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
          notes,
          status,
          offers_count,
          created_at,
          updated_at
        )
        SELECT
          COALESCE(up.full_name, split_part(up.email, '@', 1), 'Musteri') AS customer_name,
          COALESCE(up.email, CONCAT('user_', vr.user_id::TEXT, '@example.com')) AS customer_email,
          COALESCE(up.phone, '') AS customer_phone,
          COALESCE(b.name, 'Bilinmiyor') AS vehicle_brand,
          COALESCE(m.name, 'Bilinmiyor') AS vehicle_model,
          vr.year_min,
          vr.year_max,
          COALESCE(vr.price_min, 0) AS budget_min,
          COALESCE(vr.price_max, 0) AS budget_max,
          'genel' AS preferred_category,
          COALESCE(vr.description, '') AS notes,
          CASE WHEN vr.status = 'open' THEN 'new' ELSE vr.status END AS status,
          0 AS offers_count,
          COALESCE(vr.created_at, NOW()) AS created_at,
          NOW() AS updated_at
        FROM vehicle_requests vr
        LEFT JOIN user_profiles up ON up.id = vr.user_id
        LEFT JOIN brands b ON b.id = vr.brand_id
        LEFT JOIN models m ON m.id = vr.model_id
        WHERE NOT EXISTS (
          SELECT 1
          FROM car_requests cr
          WHERE cr.customer_email = COALESCE(up.email, CONCAT('user_', vr.user_id::TEXT, '@example.com'))
            AND cr.vehicle_brand = COALESCE(b.name, 'Bilinmiyor')
            AND cr.vehicle_model = COALESCE(m.name, 'Bilinmiyor')
            AND cr.budget_min = COALESCE(vr.price_min, 0)
            AND cr.budget_max = COALESCE(vr.price_max, 0)
        );
      END IF;
    END $$;
  `,
  `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='premium_memberships')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_profiles') THEN
        INSERT INTO payments (
          ad_id,
          dealer_id,
          dealer_name,
          amount,
          payment_date,
          payment_method,
          status,
          duration_days,
          created_at
        )
        SELECT
          NULL AS ad_id,
          pm.user_id AS dealer_id,
          COALESCE(up.full_name, split_part(up.email, '@', 1), 'Kullanici') AS dealer_name,
          COALESCE(pm.price, 0) AS amount,
          COALESCE(pm.start_date, NOW()) AS payment_date,
          COALESCE(pm.payment_method, 'unknown') AS payment_method,
          COALESCE(pm.payment_status, 'completed') AS status,
          GREATEST(1, COALESCE((pm.end_date::date - pm.start_date::date), 30))::INT AS duration_days,
          COALESCE(pm.created_at, NOW()) AS created_at
        FROM premium_memberships pm
        LEFT JOIN user_profiles up ON up.id = pm.user_id
        WHERE NOT EXISTS (
          SELECT 1
          FROM payments p
          WHERE p.dealer_id = pm.user_id
            AND p.amount = COALESCE(pm.price, 0)
            AND DATE(p.payment_date) = DATE(COALESCE(pm.start_date, NOW()))
        );
      END IF;
    END $$;
  `,
  `
    INSERT INTO finance_records (type, category, amount, description, reference_id, reference_type, date)
    SELECT
      'income' AS type,
      'membership' AS category,
      p.amount,
      CONCAT('Membership payment from ', p.dealer_name) AS description,
      p.id AS reference_id,
      'payment' AS reference_type,
      p.payment_date AS date
    FROM payments p
    WHERE p.amount > 0
      AND p.status IN ('completed', 'paid', 'success')
      AND NOT EXISTS (
        SELECT 1
        FROM finance_records fr
        WHERE fr.reference_id = p.id
          AND fr.reference_type = 'payment'
      );
  `,
  `
    ALTER TABLE models
    DROP CONSTRAINT IF EXISTS models_brand_id_name_key;
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_models_brand_series_name_unique
    ON models (brand_id, COALESCE(series_id, '00000000-0000-0000-0000-000000000000'::uuid), LOWER(name));
  `,
];

export const initializeDatabase = async () => {
  for (const statement of initializationStatements) {
    await pool.query(statement);
  }
};
