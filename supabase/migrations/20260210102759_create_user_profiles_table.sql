/*
  # Kullanıcı Profil Tablosu Oluşturma

  ## Yeni Tablo
    - `user_profiles` - Kullanıcı profil bilgileri
      - `id` (uuid, primary key) - Kullanıcı ID (auth.users ile ilişkili)
      - `first_name` (text) - Ad
      - `last_name` (text) - Soyad
      - `email` (text, unique) - E-posta adresi
      - `phone` (text) - Telefon numarası
      - `bio` (text) - Biyografi
      - `avatar_url` (text) - Profil resmi URL'i
      - `language` (text) - Dil tercihi
      - `timezone` (text) - Saat dilimi
      - `date_format` (text) - Tarih formatı
      - `email_notifications` (boolean) - Email bildirimleri
      - `push_notifications` (boolean) - Push bildirimleri
      - `security_alerts` (boolean) - Güvenlik uyarıları
      - `payment_updates` (boolean) - Ödeme bildirimleri
      - `created_at` (timestamptz) - Oluşturulma tarihi
      - `updated_at` (timestamptz) - Güncellenme tarihi

  ## Güvenlik
    - RLS etkin
    - Kullanıcılar sadece kendi profillerini görüntüleyebilir
    - Kullanıcılar sadece kendi profillerini güncelleyebilir

  ## Not
    Bu tablo kullanıcıların profil ve ayar bilgilerini saklar.
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  email text UNIQUE,
  phone text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text,
  language text DEFAULT 'english',
  timezone text DEFAULT 'UTC+0',
  date_format text DEFAULT 'MM/DD/YYYY',
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  security_alerts boolean DEFAULT true,
  payment_updates boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi profillerini görüntüleyebilir
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini ekleyebilir
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();