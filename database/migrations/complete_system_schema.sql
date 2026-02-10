/*
  # Tam Sistem Şeması - Araba İlan Platformu

  ## Tablolar

  ### 1. ads - İlanlar
    - İlan bilgileri, fiyat, marka, model, kategori
    - Durum ve ödeme takibi

  ### 2. payments - Ödemeler
    - İlan ödemeleri ve takibi
    - Otomatik ilan aktivasyonu

  ### 3. car_requests - Araç Talepleri
    - Müşteri araç talepleri
    - Bütçe ve tercihler

  ### 4. dealers - Galericiler
    - Galerici bilgileri ve istatistikleri
    - İletişim ve adres bilgileri

  ### 5. users - Kullanıcılar/Müşteriler
    - Müşteri ve kullanıcı bilgileri
    - Roller ve yetkiler

  ### 6. finance_records - Finans Kayıtları
    - Gelir-gider takibi
    - Finansal raporlama

  ### 7. social_media_posts - Sosyal Medya Gönderileri
    - Platform entegrasyonları
    - Gönderi takibi

  ### 8. support_tickets - Destek Talepleri
    - Müşteri destek sistemi
    - Durum takibi

  ### 9. notifications - Bildirimler
    - Sistem bildirimleri
    - Kullanıcı bildirimleri

  ### 10. settings - Sistem Ayarları
    - Platform ayarları
    - Konfigürasyonlar

  ### 11. activities - Aktivite Logları
    - Kullanıcı aktiviteleri
    - Sistem logları
*/

-- 1. Ads tablosu (İlanlar)
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  category text NOT NULL,
  dealer_id uuid NOT NULL,
  dealer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment',
  payment_status text NOT NULL DEFAULT 'unpaid',
  expiry_date timestamptz,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Payments tablosu (Ödemeler)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL,
  dealer_name text NOT NULL,
  amount numeric NOT NULL,
  payment_date timestamptz DEFAULT now(),
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  duration_days integer NOT NULL DEFAULT 30,
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- 3. Car Requests tablosu (Araç Talepleri)
CREATE TABLE IF NOT EXISTS car_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  vehicle_brand text NOT NULL,
  vehicle_model text,
  year_min integer,
  year_max integer,
  budget_min numeric NOT NULL,
  budget_max numeric NOT NULL,
  preferred_category text,
  status text NOT NULL DEFAULT 'open',
  offers_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Dealers tablosu (Galericiler)
CREATE TABLE IF NOT EXISTS dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text,
  city text,
  status text NOT NULL DEFAULT 'active',
  total_ads integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Users tablosu (Kullanıcılar/Müşteriler)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer',
  status text NOT NULL DEFAULT 'active',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Finance Records tablosu (Finans Kayıtları)
CREATE TABLE IF NOT EXISTS finance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  reference_type text,
  date timestamptz DEFAULT now(),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 7. Social Media Posts tablosu (Sosyal Medya Gönderileri)
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE,
  post_title text NOT NULL,
  post_content text,
  post_url text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Support Tickets tablosu (Destek Talepleri)
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  user_id uuid,
  user_name text NOT NULL,
  user_email text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  category text NOT NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Notifications tablosu (Bildirimler)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- 10. Settings tablosu (Sistem Ayarları)
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'string',
  category text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- 11. Activities tablosu (Aktivite Logları)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text NOT NULL,
  action text NOT NULL,
  item text,
  type text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

-- Trigger fonksiyonları

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ads tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ads_updated_at') THEN
    CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Car Requests tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_car_requests_updated_at') THEN
    CREATE TRIGGER update_car_requests_updated_at
    BEFORE UPDATE ON car_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Dealers tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dealers_updated_at') THEN
    CREATE TRIGGER update_dealers_updated_at
    BEFORE UPDATE ON dealers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Users tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Social Media Posts tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_social_media_posts_updated_at') THEN
    CREATE TRIGGER update_social_media_posts_updated_at
    BEFORE UPDATE ON social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Support Tickets tablosu trigger'ları
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_tickets_updated_at') THEN
    CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- İlan durumunu otomatik güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_ad_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE ads
    SET
      status = 'active',
      payment_status = 'paid',
      expiry_date = now() + (NEW.duration_days || ' days')::interval
    WHERE id = NEW.ad_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ad_on_payment') THEN
    CREATE TRIGGER update_ad_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_status_on_payment();
  END IF;
END $$;

-- Ticket number otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ticket_number_seq') THEN
    CREATE SEQUENCE ticket_number_seq START 1;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_ticket_number_trigger') THEN
    CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_number();
  END IF;
END $$;

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_dealer_id ON ads(dealer_id);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_ad_id ON payments(ad_id);
CREATE INDEX IF NOT EXISTS idx_payments_dealer_id ON payments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_car_requests_status ON car_requests(status);
CREATE INDEX IF NOT EXISTS idx_car_requests_created_at ON car_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_finance_records_type ON finance_records(type);
CREATE INDEX IF NOT EXISTS idx_finance_records_date ON finance_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
