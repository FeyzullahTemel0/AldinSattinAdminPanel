-- ============================================================================
-- CAR PLATFORM - COMPLETE DATABASE SCHEMA
-- PostgreSQL Database Schema for Car Advertisement Platform
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS social_media_accounts CASCADE;
DROP TABLE IF EXISTS ad_banners CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS finance_records CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS car_requests CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT UNIQUE,
  phone TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  language TEXT DEFAULT 'english',
  timezone TEXT DEFAULT 'UTC+0',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  payment_updates BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- DEALERS TABLE
-- ============================================================================
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_ads INTEGER DEFAULT 0,
  active_ads INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ADS TABLE
-- ============================================================================
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  dealer_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending_payment',
  payment_status TEXT DEFAULT 'unpaid',
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID,
  dealer_id UUID NOT NULL,
  dealer_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE SET NULL,
  FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- ============================================================================
-- CAR REQUESTS TABLE
-- ============================================================================
CREATE TABLE car_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year TEXT DEFAULT '',
  budget_min NUMERIC DEFAULT 0,
  budget_max NUMERIC DEFAULT 0,
  transmission TEXT DEFAULT 'automatic',
  fuel_type TEXT DEFAULT 'gasoline',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  offers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE DEFAULT ('TKT-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
  type TEXT CHECK (type IN ('complaint', 'support')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- FINANCE RECORDS TABLE
-- ============================================================================
CREATE TABLE finance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SETTINGS TABLE
-- ============================================================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- AD BANNERS TABLE
-- ============================================================================
CREATE TABLE ad_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('header', 'sidebar', 'homepage', 'listing', 'footer')),
  type TEXT NOT NULL CHECK (type IN ('image', 'html', 'video')),
  content TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SOCIAL MEDIA ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'telegram', 'whatsapp', 'email')),
  url TEXT NOT NULL,
  followers TEXT DEFAULT '0',
  engagement TEXT DEFAULT '0%',
  posts INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECURITY LOGS TABLE
-- ============================================================================
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('dealer', 'customer', 'guest', 'admin')),
  action TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  location_country TEXT,
  location_city TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  device_os TEXT,
  device_browser TEXT,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_suspicious BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  item TEXT DEFAULT '',
  type TEXT DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Dealers indexes
CREATE INDEX idx_dealers_status ON dealers(status);
CREATE INDEX idx_dealers_email ON dealers(email);
CREATE INDEX idx_dealers_created_at ON dealers(created_at DESC);

-- Ads indexes
CREATE INDEX idx_ads_dealer_id ON ads(dealer_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_category ON ads(category);
CREATE INDEX idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX idx_ads_brand_model ON ads(brand, model);

-- Payments indexes
CREATE INDEX idx_payments_ad_id ON payments(ad_id);
CREATE INDEX idx_payments_dealer_id ON payments(dealer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Car Requests indexes
CREATE INDEX idx_car_requests_status ON car_requests(status);
CREATE INDEX idx_car_requests_created_at ON car_requests(created_at DESC);
CREATE INDEX idx_car_requests_customer_email ON car_requests(customer_email);

-- Support Tickets indexes
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Finance Records indexes
CREATE INDEX idx_finance_type ON finance_records(type);
CREATE INDEX idx_finance_category ON finance_records(category);
CREATE INDEX idx_finance_date ON finance_records(date DESC);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Security Logs indexes
CREATE INDEX idx_security_logs_user_email ON security_logs(user_email);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX idx_security_logs_risk_level ON security_logs(risk_level);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_requests_updated_at
  BEFORE UPDATE ON car_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_accounts_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Sample Dealers
INSERT INTO dealers (company_name, contact_name, email, phone, city, total_ads, active_ads, total_sales, total_revenue, rating) VALUES
  ('AutoMax Otomotiv', 'Mehmet Yılmaz', 'info@automax.com', '+90 532 123 4567', 'İstanbul', 45, 38, 127, 8540000, 4.8),
  ('Premium Motors', 'Ayşe Demir', 'contact@premium.com', '+90 533 234 5678', 'Ankara', 32, 28, 89, 6230000, 4.6),
  ('Mega Galeri', 'Ali Kaya', 'info@megagaleri.com', '+90 534 345 6789', 'İzmir', 28, 22, 65, 4750000, 4.5),
  ('Elite Auto', 'Fatma Şahin', 'hello@eliteauto.com', '+90 535 456 7890', 'Bursa', 19, 15, 42, 3180000, 4.3),
  ('Star Motors', 'Can Öz', 'info@starmotors.com', '+90 536 567 8901', 'Antalya', 15, 12, 28, 2150000, 4.2);

-- Sample Ads
INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name, status)
SELECT
  'BMW 320i Executive',
  'Hatasız, boyasız, garaj arabası',
  950000,
  'BMW',
  '3 Serisi',
  2022,
  'Sedan',
  id,
  company_name,
  'active'
FROM dealers LIMIT 1;

INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name, status)
SELECT
  'Mercedes C200 AMG',
  'Full+Full, Panoramik tavan',
  1250000,
  'Mercedes',
  'C Serisi',
  2021,
  'Sedan',
  id,
  company_name,
  'active'
FROM dealers OFFSET 1 LIMIT 1;

INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name, status)
SELECT
  'Audi A4 40 TFSI',
  'Xenon, Deri döşeme',
  875000,
  'Audi',
  'A4',
  2021,
  'Sedan',
  id,
  company_name,
  'pending_payment'
FROM dealers OFFSET 2 LIMIT 1;

INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name, status)
SELECT
  'Volkswagen Passat 1.6 TDI',
  'Ekonomik, az yakıt tüketimi',
  485000,
  'Volkswagen',
  'Passat',
  2019,
  'Sedan',
  id,
  company_name,
  'active'
FROM dealers OFFSET 3 LIMIT 1;

INSERT INTO ads (title, description, price, brand, model, year, category, dealer_id, dealer_name, status)
SELECT
  'Toyota Corolla 1.8 Hybrid',
  'Hibrit, düşük yakıt',
  625000,
  'Toyota',
  'Corolla',
  2020,
  'Sedan',
  id,
  company_name,
  'active'
FROM dealers OFFSET 4 LIMIT 1;

-- Sample Car Requests
INSERT INTO car_requests (customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year, budget_min, budget_max, transmission, fuel_type, status, offers_count) VALUES
  ('Ahmet Çelik', 'ahmet@example.com', '+90 541 111 2222', 'BMW', '3 Serisi', '2020-2023', 800000, 1200000, 'automatic', 'diesel', 'in_progress', 5),
  ('Zeynep Acar', 'zeynep@example.com', '+90 542 222 3333', 'Mercedes', 'C Serisi', '2019-2022', 750000, 1000000, 'automatic', 'diesel', 'new', 3),
  ('Burak Yıldız', 'burak@example.com', '+90 543 333 4444', 'Audi', 'A4', '2020-2023', 900000, 1300000, 'automatic', 'gasoline', 'new', 2),
  ('Elif Arslan', 'elif@example.com', '+90 544 444 5555', 'Volkswagen', 'Passat', '2018-2021', 500000, 750000, 'automatic', 'diesel', 'completed', 8);

-- Sample Finance Records
INSERT INTO finance_records (type, category, amount, description, date) VALUES
  ('income', 'Ad Payment', 5000, 'Monthly ad payment', now() - INTERVAL '5 days'),
  ('income', 'Ad Payment', 7500, 'Premium listing payment', now() - INTERVAL '10 days'),
  ('expense', 'Server Costs', 2500, 'Monthly server hosting', now() - INTERVAL '3 days'),
  ('income', 'Ad Payment', 6000, 'Standard ad package', now() - INTERVAL '15 days'),
  ('expense', 'Marketing', 3500, 'Social media ads', now() - INTERVAL '7 days'),
  ('income', 'Ad Payment', 8500, 'VIP package', now() - INTERVAL '2 days'),
  ('expense', 'Salaries', 15000, 'Staff salaries', now() - INTERVAL '20 days'),
  ('income', 'Ad Payment', 5500, 'Monthly subscription', now() - INTERVAL '12 days');

-- Sample Settings
INSERT INTO settings (key, value, category, description) VALUES
  ('site_name', 'Car Platform', 'general', 'Site name'),
  ('maintenance_mode', 'false', 'general', 'Maintenance mode status'),
  ('ads_per_page', '20', 'ads', 'Number of ads per page'),
  ('max_upload_size', '10', 'uploads', 'Maximum upload size in MB'),
  ('enable_notifications', 'true', 'notifications', 'Enable email notifications');

-- Sample Ad Banners
INSERT INTO ad_banners (name, location, type, content, status, clicks, impressions, start_date, end_date, priority) VALUES
  ('Homepage Hero Banner', 'homepage', 'image', 'https://example.com/banner1.jpg', 'active', 150, 5000, now() - INTERVAL '10 days', now() + INTERVAL '20 days', 10),
  ('Sidebar Ad', 'sidebar', 'html', '<div>Premium Cars</div>', 'active', 80, 3200, now() - INTERVAL '5 days', now() + INTERVAL '25 days', 5),
  ('Header Banner', 'header', 'image', 'https://example.com/banner2.jpg', 'active', 200, 8500, now() - INTERVAL '15 days', now() + INTERVAL '15 days', 8),
  ('Footer Promo', 'footer', 'html', '<div>Special Offers</div>', 'inactive', 50, 1200, now() - INTERVAL '30 days', now() - INTERVAL '5 days', 3),
  ('Listing Page Ad', 'listing', 'image', 'https://example.com/banner3.jpg', 'active', 120, 4500, now() - INTERVAL '7 days', now() + INTERVAL '23 days', 7);

-- Sample Social Media Accounts
INSERT INTO social_media_accounts (name, platform, url, followers, engagement, posts, is_active) VALUES
  ('Car Platform Official', 'facebook', 'https://facebook.com/carplatform', '45000', '3.5%', 234, true),
  ('Car Platform', 'instagram', 'https://instagram.com/carplatform', '67000', '5.2%', 456, true),
  ('Car Platform TR', 'twitter', 'https://twitter.com/carplatform', '28000', '2.8%', 892, true),
  ('Car Platform Channel', 'youtube', 'https://youtube.com/carplatform', '15000', '4.1%', 78, true),
  ('Car Platform Pro', 'linkedin', 'https://linkedin.com/company/carplatform', '8500', '1.9%', 145, true),
  ('Car Platform Updates', 'telegram', 'https://t.me/carplatform', '12000', '6.3%', 567, true),
  ('Car Platform Support', 'whatsapp', '+90 555 123 4567', '0', '0%', 0, true),
  ('Car Platform Info', 'email', 'info@carplatform.com', '0', '0%', 0, true);

-- Sample Security Logs
INSERT INTO security_logs (user_name, user_email, user_type, action, ip_address, location_country, location_city, device_type, device_os, device_browser, risk_level, is_suspicious) VALUES
  ('Admin User', 'admin@example.com', 'admin', 'Logged in', '192.168.1.100', 'Turkey', 'Istanbul', 'desktop', 'Windows 10', 'Chrome', 'low', false),
  ('Mehmet Yılmaz', 'info@automax.com', 'dealer', 'Created new ad', '192.168.1.101', 'Turkey', 'Istanbul', 'desktop', 'Windows 11', 'Firefox', 'low', false),
  ('Guest User', NULL, 'guest', 'Viewed listings', '192.168.1.102', 'Turkey', 'Ankara', 'mobile', 'iOS', 'Safari', 'low', false),
  ('Ayşe Demir', 'contact@premium.com', 'dealer', 'Updated profile', '192.168.1.103', 'Turkey', 'Ankara', 'tablet', 'Android', 'Chrome', 'low', false),
  ('Unknown User', 'suspicious@test.com', 'guest', 'Multiple failed logins', '45.123.45.67', 'Unknown', 'Unknown', 'desktop', 'Linux', 'Chrome', 'high', true);

-- Sample Activities
INSERT INTO activities (user_name, action, item, type) VALUES
  ('Admin', 'yeni ilan ekledi', 'BMW 320i 2023', 'success'),
  ('Mehmet Yılmaz', 'ödeme yaptı', 'Mercedes C200', 'success'),
  ('Ayşe Demir', 'ilanı güncelledi', 'Audi A4 2022', 'info'),
  ('Admin', 'destek talebini çözdü', 'Ticket #1234', 'success'),
  ('Ali Kaya', 'ilan yayınladı', 'Volkswagen Passat', 'success'),
  ('System', 'otomatik yedekleme tamamlandı', '', 'info'),
  ('Fatma Şahin', 'profil bilgilerini güncelledi', '', 'info'),
  ('Can Öz', 'yeni kullanıcı kaydoldu', '', 'success');

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================
