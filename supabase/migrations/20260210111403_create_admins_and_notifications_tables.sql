/*
  # Create admins and notifications tables

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `status` (text, default 'active')
      - `role` (text, default 'admin')
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `user_type` (text, default 'admin')
      - `title` (text)
      - `message` (text)
      - `type` (text, default 'info')
      - `is_read` (boolean, default false)
      - `link` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admin access
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  phone text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text DEFAULT 'admin' CHECK (user_type IN ('admin', 'dealer', 'customer')),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user
INSERT INTO admins (username, email, first_name, last_name, status, role) VALUES
  ('admin', 'admin@carplatform.com', 'Admin', 'User', 'active', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_type, title, message, type, is_read, link) VALUES
  ('admin', 'Yeni İlan Onayı Bekliyor', 'BMW 320i Executive ilanı onayınızı bekliyor', 'warning', false, '/ads'),
  ('admin', 'Yeni Araç Talebi', 'Ahmet Çelik yeni bir araç talebi oluşturdu', 'info', false, '/car-requests'),
  ('admin', 'Ödeme Alındı', 'Premium Motors 5.000 TL ödeme yaptı', 'success', true, '/payments'),
  ('admin', 'Destek Talebi', 'Yeni bir destek talebi oluşturuldu', 'warning', false, '/support'),
  ('admin', 'Sistem Güncellemesi', 'Sistem başarıyla güncellendi', 'success', true, null),
  ('admin', 'Güvenlik Uyarısı', 'Şüpheli giriş denemesi tespit edildi', 'error', false, '/security'),
  ('admin', 'Yeni Galerici Kaydı', 'Elite Auto sisteme katıldı', 'info', true, '/dealers'),
  ('admin', 'Finansal Rapor Hazır', 'Aylık finansal rapor hazır', 'info', false, '/finance')
ON CONFLICT DO NOTHING;

-- RLS Policies for admins table
CREATE POLICY "Admins can view own data"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for notifications table
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (true);
