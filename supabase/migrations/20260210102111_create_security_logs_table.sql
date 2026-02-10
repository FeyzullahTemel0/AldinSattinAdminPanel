/*
  # Güvenlik Log Kayıtları Tablosu Oluşturma

  ## Yeni Tablo
    - `security_logs` - Kullanıcı aktivite ve güvenlik logları
      - `id` (uuid, primary key) - Benzersiz log ID'si
      - `user_name` (text, required) - Kullanıcı adı
      - `user_email` (text, nullable) - Kullanıcı e-posta
      - `user_type` (text, required) - Kullanıcı tipi (dealer, customer, guest)
      - `action` (text, required) - Yapılan işlem
      - `ip_address` (text, required) - IP adresi
      - `mac_address` (text, nullable) - MAC adresi
      - `location_country` (text, nullable) - Ülke
      - `location_city` (text, nullable) - Şehir
      - `device_type` (text, nullable) - Cihaz tipi (desktop, mobile, tablet)
      - `device_os` (text, nullable) - İşletim sistemi
      - `device_browser` (text, nullable) - Tarayıcı
      - `risk_level` (text) - Risk seviyesi (low, medium, high, critical)
      - `is_suspicious` (boolean) - Şüpheli mi?
      - `timestamp` (timestamptz) - İşlem zamanı
      - `created_at` (timestamptz) - Kayıt zamanı

  ## Güvenlik
    - RLS etkin
    - Yalnızca yetkili kullanıcılar güvenlik loglarını okuyabilir
    - Sistem otomatik olarak log kayıtları ekleyebilir
    - Loglar silinemez, sadece görüntülenebilir

  ## Not
    Bu tablo KVKK kapsamında korunmaktadır.
    Veriler sadece güvenlik, dolandırıcılık önleme ve yasal yükümlülükler için kullanılabilir.
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text,
  user_type text NOT NULL CHECK (user_type IN ('dealer', 'customer', 'guest', 'admin')),
  action text NOT NULL,
  ip_address text NOT NULL,
  mac_address text,
  location_country text,
  location_city text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  device_os text,
  device_browser text,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_suspicious boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Yetkili kullanıcılar için SELECT policy
CREATE POLICY "Authenticated users can view security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Sistem için INSERT policy
CREATE POLICY "Authenticated users can insert security logs"
  ON security_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_security_logs_user_type ON security_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_level ON security_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_logs_suspicious ON security_logs(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);

-- Örnek güvenlik log kayıtları ekle
INSERT INTO security_logs (user_name, user_email, user_type, action, ip_address, mac_address, location_country, location_city, device_type, device_os, device_browser, risk_level, is_suspicious, timestamp) VALUES
  ('Ahmet Yılmaz', 'ahmet@example.com', 'dealer', 'İlan oluşturma', '185.123.45.67', '00:1B:44:11:3A:B7', 'Türkiye', 'İstanbul', 'desktop', 'Windows 11', 'Chrome 120', 'low', false, NOW() - INTERVAL '5 minutes'),
  ('Bilinmeyen', 'test@suspicious.com', 'guest', 'Çoklu giriş denemesi', '194.27.45.123', '00:A0:C9:14:C8:29', 'Rusya', 'Moskova', 'desktop', 'Linux', 'Firefox 115', 'critical', true, NOW() - INTERVAL '10 minutes'),
  ('Ayşe Demir', 'ayse@example.com', 'customer', 'Araç talebi oluşturma', '78.190.23.45', '00:50:56:C0:00:08', 'Türkiye', 'Ankara', 'mobile', 'iOS 17', 'Safari 17', 'low', false, NOW() - INTERVAL '20 minutes'),
  ('Mehmet Kaya', 'mehmet@example.com', 'dealer', 'Ödeme işlemi', '212.58.123.89', '00:B0:D0:63:C2:26', 'Türkiye', 'İzmir', 'desktop', 'macOS 14', 'Safari 17', 'medium', false, NOW() - INTERVAL '25 minutes'),
  ('Şüpheli Kullanıcı', 'scam@fake.net', 'guest', 'SQL Injection denemesi', '45.142.212.61', 'FF:FF:FF:FF:FF:FF', 'Ukrayna', 'Kiev', 'desktop', 'Linux', 'Wget', 'critical', true, NOW() - INTERVAL '30 minutes'),
  ('Zeynep Şahin', 'zeynep@example.com', 'customer', 'İlan görüntüleme', '88.234.156.78', '00:0C:29:3B:78:2F', 'Türkiye', 'Bursa', 'tablet', 'Android 13', 'Chrome 119', 'low', false, NOW() - INTERVAL '40 minutes'),
  ('Can Öztürk', 'can@example.com', 'dealer', 'Profil güncelleme', '176.88.12.34', '00:14:22:01:23:45', 'Türkiye', 'Antalya', 'mobile', 'Android 14', 'Chrome 121', 'low', false, NOW() - INTERVAL '1 hour'),
  ('Fatma Yıldız', 'fatma@example.com', 'customer', 'Mesaj gönderme', '85.102.67.89', '00:1A:2B:3C:4D:5E', 'Türkiye', 'Adana', 'desktop', 'Windows 10', 'Edge 120', 'low', false, NOW() - INTERVAL '2 hours'),
  ('Bilinmeyen', 'hacker@test.com', 'guest', 'XSS denemesi', '103.45.78.12', 'AA:BB:CC:DD:EE:FF', 'Çin', 'Beijing', 'desktop', 'Linux', 'curl', 'critical', true, NOW() - INTERVAL '3 hours'),
  ('Ali Koç', 'ali@example.com', 'dealer', 'İlan düzenleme', '94.123.78.45', '00:50:56:A1:B2:C3', 'Türkiye', 'Konya', 'desktop', 'Windows 11', 'Chrome 120', 'low', false, NOW() - INTERVAL '4 hours');
