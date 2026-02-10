/*
  # Reklam Banner Yönetimi Tablosu Oluşturma

  ## Yeni Tablo
    - `ad_banners` - Site içi reklam banner yönetimi
      - `id` (uuid, primary key) - Benzersiz banner ID'si
      - `name` (text, required) - Banner adı
      - `location` (text, required) - Banner konumu (header, sidebar, homepage, listing, footer)
      - `type` (text, required) - Banner tipi (image, html, video)
      - `content` (text, nullable) - Banner içeriği (URL veya HTML)
      - `status` (text, required) - Durum (active, inactive, scheduled)
      - `clicks` (integer) - Tıklama sayısı
      - `impressions` (integer) - Gösterim sayısı
      - `start_date` (timestamptz, required) - Başlangıç tarihi
      - `end_date` (timestamptz, required) - Bitiş tarihi
      - `priority` (integer) - Öncelik sırası (1 en yüksek)
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

  ## Güvenlik
    - RLS etkin
    - Yalnızca yetkili kullanıcılar banner verilerini okuyabilir
    - Yalnızca yetkili kullanıcılar banner ekleyebilir
    - Yalnızca yetkili kullanıcılar banner güncelleyebilir
    - Yalnızca yetkili kullanıcılar banner silebilir

  ## Not
    Bu tablo site içerisinde gösterilen reklam banner alanlarını yönetir.
    Galericilerin yayınladığı araç ilanlarından farklıdır.
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS ad_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL CHECK (location IN ('header', 'sidebar', 'homepage', 'listing', 'footer')),
  type text NOT NULL CHECK (type IN ('image', 'html', 'video')),
  content text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  priority integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;

-- Yetkili kullanıcılar için SELECT policy
CREATE POLICY "Authenticated users can view ad banners"
  ON ad_banners
  FOR SELECT
  TO authenticated
  USING (true);

-- Yetkili kullanıcılar için INSERT policy
CREATE POLICY "Authenticated users can insert ad banners"
  ON ad_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Yetkili kullanıcılar için UPDATE policy
CREATE POLICY "Authenticated users can update ad banners"
  ON ad_banners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Yetkili kullanıcılar için DELETE policy
CREATE POLICY "Authenticated users can delete ad banners"
  ON ad_banners
  FOR DELETE
  TO authenticated
  USING (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_ad_banners_location ON ad_banners(location);
CREATE INDEX IF NOT EXISTS idx_ad_banners_status ON ad_banners(status);
CREATE INDEX IF NOT EXISTS idx_ad_banners_dates ON ad_banners(start_date, end_date);

-- Örnek banner verileri ekle
INSERT INTO ad_banners (name, location, type, content, status, clicks, impressions, start_date, end_date, priority) VALUES
  ('Ana Sayfa Üst Banner', 'header', 'image', 'https://example.com/banner1.jpg', 'active', 1234, 45678, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 1),
  ('Sidebar Reklam Alanı', 'sidebar', 'html', '<div class="ad">Reklam İçeriği</div>', 'active', 567, 23456, NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days', 2),
  ('Ana Sayfa Video Reklam', 'homepage', 'video', 'https://example.com/video.mp4', 'inactive', 234, 12345, NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', 3),
  ('Liste Sayfası Banner', 'listing', 'image', 'https://example.com/banner2.jpg', 'scheduled', 0, 0, NOW() + INTERVAL '10 days', NOW() + INTERVAL '70 days', 1),
  ('Footer Sponsor Banner', 'footer', 'image', 'https://example.com/banner3.jpg', 'active', 890, 34567, NOW() - INTERVAL '60 days', NOW() + INTERVAL '300 days', 4);
