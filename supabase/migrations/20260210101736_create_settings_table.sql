/*
  # Sistem Ayarları Tablosu Oluşturma

  ## Yeni Tablo
    - `settings` - Platform ayarları
      - `key` (text, primary key) - Ayar anahtarı
      - `value` (text, required) - Ayar değeri
      - `category` (text, nullable) - Kategori (finance, general, vb.)
      - `description` (text, nullable) - Açıklama
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

  ## Güvenlik
    - RLS etkin
    - Yalnızca yetkili kullanıcılar ayarları okuyabilir
    - Yalnızca yetkili kullanıcılar ayarları güncelleyebilir

  ## Not
    Bu tablo platform genelindeki ayarları saklar.
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  category text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Yetkili kullanıcılar için SELECT policy
CREATE POLICY "Authenticated users can view settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Yetkili kullanıcılar için INSERT policy
CREATE POLICY "Authenticated users can insert settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Yetkili kullanıcılar için UPDATE policy
CREATE POLICY "Authenticated users can update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Yetkili kullanıcılar için DELETE policy
CREATE POLICY "Authenticated users can delete settings"
  ON settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Varsayılan finans ayarlarını ekle
INSERT INTO settings (key, value, category, description) VALUES
  ('tax_rate', '18', 'finance', 'Vergi oranı yüzdesi'),
  ('expense_hosting', '300', 'finance', 'Aylık hosting maliyeti'),
  ('expense_domain', '60', 'finance', 'Aylık domain maliyeti'),
  ('expense_ads', '4500', 'finance', 'Aylık reklam harcaması'),
  ('expense_equipment', '1500', 'finance', 'Aylık ekipman gideri')
ON CONFLICT (key) DO NOTHING;
