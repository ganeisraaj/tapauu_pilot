-- 1. Create the universities table
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add university_id to users and vendors
ALTER TABLE users ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);

-- 3. Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON universities FOR SELECT USING (true);

-- 4. Seed initial universities
INSERT INTO universities (name, slug) VALUES 
('UniKL (Universiti Kuala Lumpur)', 'unikl'),
('UNITEN (Universiti Tenaga Nasional)', 'uniten'),
('Sunway University', 'sunway')
ON CONFLICT (slug) DO NOTHING;
