/*
  # Sosyal Medya Hesapları Tablosu Oluşturma

  ## Yeni Tablo
    - `social_media_accounts` - Sosyal medya hesap yönetimi
      - `id` (uuid, primary key) - Benzersiz hesap ID'si
      - `name` (text, required) - Sosyal medya platformu adı
      - `platform` (text, required) - Platform türü (facebook, instagram, twitter, vb.)
      - `url` (text, required) - Hesap URL'si
      - `followers` (text, nullable) - Takipçi sayısı (formatlanmış string)
      - `engagement` (text, nullable) - Etkileşim oranı (formatlanmış string)
      - `posts` (integer) - Toplam gönderi sayısı
      - `is_active` (boolean) - Aktif mi?
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

  ## Güvenlik
    - RLS etkin
    - Yalnızca yetkili kullanıcılar sosyal medya hesaplarını okuyabilir
    - Yalnızca yetkili kullanıcılar hesap ekleyebilir
    - Yalnızca yetkili kullanıcılar hesap güncelleyebilir
    - Yalnızca yetkili kullanıcılar hesap silebilir

  ## Not
    Bu tablo platform sosyal medya hesaplarını yönetir ve takip eder.
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'telegram', 'whatsapp', 'email')),
  url text NOT NULL,
  followers text DEFAULT '0',
  engagement text DEFAULT '0%',
  posts integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;

-- Yetkili kullanıcılar için SELECT policy
CREATE POLICY "Authenticated users can view social media accounts"
  ON social_media_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- Yetkili kullanıcılar için INSERT policy
CREATE POLICY "Authenticated users can insert social media accounts"
  ON social_media_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Yetkili kullanıcılar için UPDATE policy
CREATE POLICY "Authenticated users can update social media accounts"
  ON social_media_accounts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Yetkili kullanıcılar için DELETE policy
CREATE POLICY "Authenticated users can delete social media accounts"
  ON social_media_accounts
  FOR DELETE
  TO authenticated
  USING (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_active ON social_media_accounts(is_active);

-- Örnek sosyal medya hesapları ekle
INSERT INTO social_media_accounts (name, platform, url, followers, engagement, posts, is_active) VALUES
  ('Facebook', 'facebook', 'https://facebook.com/your-page', '12.5K', '4.2%', 234, true),
  ('Instagram', 'instagram', 'https://instagram.com/your-account', '18.3K', '6.8%', 456, true),
  ('WhatsApp Business', 'whatsapp', 'https://wa.me/905321234567', '2.1K', '92%', 0, true),
  ('Twitter (X)', 'twitter', 'https://twitter.com/your-account', '8.7K', '3.5%', 1234, true),
  ('YouTube', 'youtube', 'https://youtube.com/@your-channel', '5.2K', '8.1%', 87, true),
  ('LinkedIn', 'linkedin', 'https://linkedin.com/company/your-company', '3.4K', '5.2%', 156, true),
  ('Telegram', 'telegram', 'https://t.me/your-channel', '4.1K', '12.3%', 389, true),
  ('Email', 'email', 'mailto:info@example.com', '15.6K', '28%', 0, true);
