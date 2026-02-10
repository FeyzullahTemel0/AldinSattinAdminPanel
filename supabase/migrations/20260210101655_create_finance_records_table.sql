/*
  # Finans Kayıtları Tablosu Oluşturma

  ## Yeni Tablo
    - `finance_records` - Gelir ve gider kayıtları
      - `id` (uuid, primary key) - Benzersiz kayıt ID'si
      - `type` (text, required) - Kayıt tipi (income/expense)
      - `category` (text, required) - Kategori (ads, hosting, domain, equipment, vb.)
      - `amount` (numeric, required) - Tutar
      - `description` (text, nullable) - Açıklama
      - `reference_id` (uuid, nullable) - İlişkili kayıt ID'si (örn: payment_id)
      - `reference_type` (text, nullable) - İlişkili kayıt tipi
      - `date` (timestamptz) - İşlem tarihi
      - `created_by` (uuid, nullable) - Oluşturan kullanıcı ID'si
      - `created_at` (timestamptz) - Oluşturulma tarihi

  ## Güvenlik
    - RLS etkin
    - Yalnızca yetkili kullanıcılar verileri okuyabilir
    - Yalnızca yetkili kullanıcılar kayıt ekleyebilir
    - Yalnızca yetkili kullanıcılar kayıt güncelleyebilir
    - Yalnızca yetkili kullanıcılar kayıt silebilir

  ## Not
    Bu tablo platform gelir ve giderlerini takip etmek için kullanılır.
    - income: Gelir kayıtları (ilan ödemeleri vb.)
    - expense: Gider kayıtları (hosting, domain, reklam, ekipman vb.)
*/

-- Tablo oluştur
CREATE TABLE IF NOT EXISTS finance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  description text,
  reference_id uuid,
  reference_type text,
  date timestamptz DEFAULT now(),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;

-- Yetkili kullanıcılar için SELECT policy
CREATE POLICY "Authenticated users can view finance records"
  ON finance_records
  FOR SELECT
  TO authenticated
  USING (true);

-- Yetkili kullanıcılar için INSERT policy
CREATE POLICY "Authenticated users can insert finance records"
  ON finance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Yetkili kullanıcılar için UPDATE policy
CREATE POLICY "Authenticated users can update finance records"
  ON finance_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Yetkili kullanıcılar için DELETE policy
CREATE POLICY "Authenticated users can delete finance records"
  ON finance_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_finance_records_type ON finance_records(type);
CREATE INDEX IF NOT EXISTS idx_finance_records_category ON finance_records(category);
CREATE INDEX IF NOT EXISTS idx_finance_records_date ON finance_records(date);
CREATE INDEX IF NOT EXISTS idx_finance_records_reference ON finance_records(reference_id, reference_type);

-- Örnek gelir kayıtları ekle
INSERT INTO finance_records (type, category, amount, description, date) VALUES
  ('income', 'ad_payment', 15000, 'Ocak ayı ilan ödemeleri', NOW() - INTERVAL '5 months'),
  ('income', 'ad_payment', 18000, 'Şubat ayı ilan ödemeleri', NOW() - INTERVAL '4 months'),
  ('income', 'ad_payment', 20000, 'Mart ayı ilan ödemeleri', NOW() - INTERVAL '3 months'),
  ('income', 'ad_payment', 22000, 'Nisan ayı ilan ödemeleri', NOW() - INTERVAL '2 months'),
  ('income', 'ad_payment', 25000, 'Mayıs ayı ilan ödemeleri', NOW() - INTERVAL '1 month'),
  ('income', 'ad_payment', 28000, 'Haziran ayı ilan ödemeleri', NOW());

-- Örnek gider kayıtları ekle
INSERT INTO finance_records (type, category, amount, description, date) VALUES
  ('expense', 'hosting', 300, 'Ocak ayı hosting maliyeti', NOW() - INTERVAL '5 months'),
  ('expense', 'domain', 60, 'Ocak ayı domain maliyeti', NOW() - INTERVAL '5 months'),
  ('expense', 'ads', 4500, 'Ocak ayı reklam harcaması', NOW() - INTERVAL '5 months'),
  ('expense', 'equipment', 1500, 'Ocak ayı ekipman gideri', NOW() - INTERVAL '5 months'),
  
  ('expense', 'hosting', 300, 'Şubat ayı hosting maliyeti', NOW() - INTERVAL '4 months'),
  ('expense', 'domain', 60, 'Şubat ayı domain maliyeti', NOW() - INTERVAL '4 months'),
  ('expense', 'ads', 4500, 'Şubat ayı reklam harcaması', NOW() - INTERVAL '4 months'),
  ('expense', 'equipment', 1500, 'Şubat ayı ekipman gideri', NOW() - INTERVAL '4 months'),
  
  ('expense', 'hosting', 300, 'Mart ayı hosting maliyeti', NOW() - INTERVAL '3 months'),
  ('expense', 'domain', 60, 'Mart ayı domain maliyeti', NOW() - INTERVAL '3 months'),
  ('expense', 'ads', 4500, 'Mart ayı reklam harcaması', NOW() - INTERVAL '3 months'),
  ('expense', 'equipment', 1500, 'Mart ayı ekipman gideri', NOW() - INTERVAL '3 months'),
  
  ('expense', 'hosting', 300, 'Nisan ayı hosting maliyeti', NOW() - INTERVAL '2 months'),
  ('expense', 'domain', 60, 'Nisan ayı domain maliyeti', NOW() - INTERVAL '2 months'),
  ('expense', 'ads', 4500, 'Nisan ayı reklam harcaması', NOW() - INTERVAL '2 months'),
  ('expense', 'equipment', 1500, 'Nisan ayı ekipman gideri', NOW() - INTERVAL '2 months'),
  
  ('expense', 'hosting', 300, 'Mayıs ayı hosting maliyeti', NOW() - INTERVAL '1 month'),
  ('expense', 'domain', 60, 'Mayıs ayı domain maliyeti', NOW() - INTERVAL '1 month'),
  ('expense', 'ads', 4500, 'Mayıs ayı reklam harcaması', NOW() - INTERVAL '1 month'),
  ('expense', 'equipment', 1500, 'Mayıs ayı ekipman gideri', NOW() - INTERVAL '1 month'),
  
  ('expense', 'hosting', 300, 'Haziran ayı hosting maliyeti', NOW()),
  ('expense', 'domain', 60, 'Haziran ayı domain maliyeti', NOW()),
  ('expense', 'ads', 4500, 'Haziran ayı reklam harcaması', NOW()),
  ('expense', 'equipment', 1500, 'Haziran ayı ekipman gideri', NOW());
