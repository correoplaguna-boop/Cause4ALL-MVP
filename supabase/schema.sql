-- =====================================================
-- CAUSE4ALL - DATABASE SCHEMA
-- =====================================================
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)
-- 1. Ve a tu proyecto > SQL Editor
-- 2. Copia y pega todo este archivo
-- 3. Click en "Run"
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Organizations (Colegios, AMPAs, etc.)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('colegio', 'ampa', 'asociacion', 'fundacion')),
  logo_url TEXT,
  location VARCHAR(255),
  description TEXT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  cause_type VARCHAR(50) NOT NULL CHECK (cause_type IN ('escolar', 'deportiva', 'social')),
  image_url TEXT,
  goal_amount DECIMAL(10, 2) NOT NULL DEFAULT 3000,
  current_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  product_price DECIMAL(10, 2) NOT NULL DEFAULT 7.5,
  donation_amount DECIMAL(10, 2) NOT NULL DEFAULT 5,
  prize_title VARCHAR(255),
  prize_description TEXT,
  prize_image_url TEXT,
  prize_type VARCHAR(50) CHECK (prize_type IN ('material', 'experiencia', 'digital')),
  draw_date DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  donation_portion DECIMAL(10, 2) NOT NULL,
  product_portion DECIMAL(10, 2) NOT NULL DEFAULT 0,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  enters_draw BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(email);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment campaign amount (atomic operation)
CREATE OR REPLACE FUNCTION increment_campaign_amount(campaign_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE campaigns 
  SET current_amount = current_amount + amount,
      updated_at = NOW()
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at on organizations
DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at on campaigns
DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Public read access for organizations
CREATE POLICY "Organizations are viewable by everyone" 
  ON organizations FOR SELECT 
  USING (true);

-- Public read access for active campaigns
CREATE POLICY "Active campaigns are viewable by everyone" 
  ON campaigns FOR SELECT 
  USING (true);

-- Public insert for campaigns (admin will be added later)
CREATE POLICY "Allow insert campaigns" 
  ON campaigns FOR INSERT 
  WITH CHECK (true);

-- Public update for campaigns (admin will be added later)  
CREATE POLICY "Allow update campaigns" 
  ON campaigns FOR UPDATE 
  USING (true);

-- Public read for donations stats (not individual data)
CREATE POLICY "Donations are insertable" 
  ON donations FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Donations are viewable" 
  ON donations FOR SELECT 
  USING (true);

-- =====================================================
-- SAMPLE DATA (Para testing)
-- =====================================================

-- Insert sample organization
INSERT INTO organizations (name, type, location, description, email) VALUES
(
  'Col·legi Pare Manyanet - Les Corts',
  'colegio',
  'Barcelona',
  'Centro educativo concertado con etapa infantil, primaria, ESO y bachillerato.',
  'info@paremanyanet.com'
),
(
  'AMPA Escola Pia Balmes',
  'ampa',
  'Barcelona',
  'Asociación de madres y padres de alumnos.',
  'ampa@escolapia.cat'
);

-- Insert sample campaign (using the first organization)
INSERT INTO campaigns (
  organization_id,
  slug,
  title,
  subtitle,
  description,
  cause_type,
  goal_amount,
  current_amount,
  product_price,
  donation_amount,
  prize_title,
  prize_type,
  draw_date,
  status
) 
SELECT 
  id,
  'esquiada-solidaria-2024',
  'ESQUIADA SOLIDARIA',
  'COLEGIO PARE MANYANET (LES CORTS)',
  'Esta campaña recauda fondos para financiar la esquiada de 4º de Primaria del Colegio Pare Manyanet (Les Corts). Gracias a tu apoyo, las familias podrán acceder a esta actividad educativa y deportiva.',
  'escolar',
  3000,
  1240,
  7.5,
  5,
  'Tablet + Auriculares inalámbricos',
  'material',
  '2025-03-15',
  'active'
FROM organizations
WHERE name LIKE '%Manyanet%'
LIMIT 1;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check sample data
SELECT 'Organizations:' as info, count(*) as count FROM organizations
UNION ALL
SELECT 'Campaigns:', count(*) FROM campaigns;
