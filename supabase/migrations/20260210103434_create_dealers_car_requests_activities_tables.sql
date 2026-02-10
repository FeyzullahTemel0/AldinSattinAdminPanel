/*
  # Galericiler, Araç Talepleri ve Aktiviteler Tabloları

  ## Yeni Tablolar
    - `dealers` - Galerici bilgileri
      - `id` (uuid, primary key)
      - `company_name` (text) - Şirket adı
      - `contact_name` (text) - İletişim kişisi
      - `email` (text, unique) - E-posta
      - `phone` (text) - Telefon
      - `address` (text) - Adres
      - `city` (text) - Şehir
      - `status` (text) - Durum (active, inactive, suspended)
      - `total_ads` (integer) - Toplam ilan sayısı
      - `active_ads` (integer) - Aktif ilan sayısı
      - `total_sales` (integer) - Toplam satış
      - `total_revenue` (numeric) - Toplam gelir
      - `rating` (numeric) - Değerlendirme
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

    - `car_requests` - Araç talepleri
      - `id` (uuid, primary key)
      - `customer_name` (text) - Müşteri adı
      - `customer_email` (text) - Müşteri e-posta
      - `customer_phone` (text) - Müşteri telefon
      - `vehicle_brand` (text) - Marka
      - `vehicle_model` (text) - Model
      - `vehicle_year` (text) - Yıl aralığı
      - `budget_min` (numeric) - Minimum bütçe
      - `budget_max` (numeric) - Maksimum bütçe
      - `transmission` (text) - Vites tipi
      - `fuel_type` (text) - Yakıt tipi
      - `notes` (text) - Notlar
      - `status` (text) - Durum (new, in_progress, completed, cancelled)
      - `offers_count` (integer) - Teklif sayısı
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

    - `activities` - Sistem aktiviteleri
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Kullanıcı ID
      - `user_name` (text) - Kullanıcı adı
      - `action` (text) - Aksiyon
      - `item` (text) - İlgili öğe
      - `type` (text) - Tip (success, error, warning, info)
      - `created_at` (timestamptz) - Oluşturulma tarihi

  ## Güvenlik
    - Her tablo için RLS etkin
    - Yetkili kullanıcılar verilerine erişebilir

  ## Not
    Bu tablolar dashboard ve diğer sayfalar için gerekli verileri saklar.
*/

-- Dealers tablosu
CREATE TABLE IF NOT EXISTS dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  city text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_ads integer DEFAULT 0,
  active_ads integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Car Requests tablosu
CREATE TABLE IF NOT EXISTS car_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  vehicle_brand text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year text DEFAULT '',
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 0,
  transmission text DEFAULT 'automatic',
  fuel_type text DEFAULT 'gasoline',
  notes text DEFAULT '',
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  offers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities tablosu
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text NOT NULL,
  action text NOT NULL,
  item text DEFAULT '',
  type text DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
  created_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Dealers policies
CREATE POLICY "Authenticated users can view dealers"
  ON dealers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dealers"
  ON dealers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dealers"
  ON dealers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dealers"
  ON dealers FOR DELETE
  TO authenticated
  USING (true);

-- Car Requests policies
CREATE POLICY "Authenticated users can view car requests"
  ON car_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert car requests"
  ON car_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update car requests"
  ON car_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete car requests"
  ON car_requests FOR DELETE
  TO authenticated
  USING (true);

-- Activities policies
CREATE POLICY "Authenticated users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_created_at ON dealers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_car_requests_status ON car_requests(status);
CREATE INDEX IF NOT EXISTS idx_car_requests_created_at ON car_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Örnek veri ekle
INSERT INTO dealers (company_name, contact_name, email, phone, city, total_ads, active_ads, total_sales, total_revenue, rating) VALUES
  ('AutoMax Otomotiv', 'Mehmet Yılmaz', 'info@automax.com', '+90 532 123 4567', 'İstanbul', 45, 38, 127, 8540000, 4.8),
  ('Premium Motors', 'Ayşe Demir', 'contact@premium.com', '+90 533 234 5678', 'Ankara', 32, 28, 89, 6230000, 4.6),
  ('Mega Galeri', 'Ali Kaya', 'info@megagaleri.com', '+90 534 345 6789', 'İzmir', 28, 22, 65, 4750000, 4.5),
  ('Elite Auto', 'Fatma Şahin', 'hello@eliteauto.com', '+90 535 456 7890', 'Bursa', 19, 15, 42, 3180000, 4.3),
  ('Star Motors', 'Can Öz', 'info@starmotors.com', '+90 536 567 8901', 'Antalya', 15, 12, 28, 2150000, 4.2)
ON CONFLICT (email) DO NOTHING;

INSERT INTO car_requests (customer_name, customer_email, customer_phone, vehicle_brand, vehicle_model, vehicle_year, budget_min, budget_max, transmission, fuel_type, status, offers_count) VALUES
  ('Ahmet Çelik', 'ahmet@example.com', '+90 541 111 2222', 'BMW', '3 Serisi', '2020-2023', 800000, 1200000, 'automatic', 'diesel', 'in_progress', 5),
  ('Zeynep Acar', 'zeynep@example.com', '+90 542 222 3333', 'Mercedes', 'C Serisi', '2019-2022', 750000, 1000000, 'automatic', 'diesel', 'new', 3),
  ('Burak Yıldız', 'burak@example.com', '+90 543 333 4444', 'Audi', 'A4', '2020-2023', 900000, 1300000, 'automatic', 'gasoline', 'new', 2),
  ('Elif Arslan', 'elif@example.com', '+90 544 444 5555', 'Volkswagen', 'Passat', '2018-2021', 500000, 750000, 'automatic', 'diesel', 'completed', 8)
ON CONFLICT DO NOTHING;

INSERT INTO activities (user_name, action, item, type) VALUES
  ('Admin', 'yeni ilan ekledi', 'BMW 320i 2023', 'success'),
  ('Mehmet Yılmaz', 'ödeme yaptı', 'Mercedes C200', 'success'),
  ('Ayşe Demir', 'ilanı güncelledi', 'Audi A4 2022', 'info'),
  ('Admin', 'destek talebini çözdü', 'Ticket #1234', 'success'),
  ('Ali Kaya', 'ilan yayınladı', 'Volkswagen Passat', 'success'),
  ('System', 'otomatik yedekleme tamamlandı', '', 'info'),
  ('Fatma Şahin', 'profil bilgilerini güncelledi', '', 'info'),
  ('Can Öz', 'yeni kullanıcı kaydoldu', '', 'success')
ON CONFLICT DO NOTHING;

-- Updated_at otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_requests_updated_at
  BEFORE UPDATE ON car_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();