-- Adevus Launchpad: Extend data model for Adevus product tracking
-- Adds product metadata, roadmap milestones, security tracking, and owner fields

-- =============================================================================
-- 1. Add 'Security' to item_type enum
-- =============================================================================
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'Security';

-- =============================================================================
-- 2. Extend apps table with Adevus product metadata
-- =============================================================================
ALTER TABLE apps ADD COLUMN IF NOT EXISTS priority_tier text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS product_status text DEFAULT 'Planned';
ALTER TABLE apps ADD COLUMN IF NOT EXISTS owner text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS repo_url text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS hosting_url text;

-- =============================================================================
-- 3. Extend items table with roadmap/security/owner fields
-- =============================================================================
ALTER TABLE items ADD COLUMN IF NOT EXISTS roadmap_milestone text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS security_severity text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE items ADD COLUMN IF NOT EXISTS owner text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS dependency text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_blocker boolean DEFAULT false;

-- =============================================================================
-- 4. Create milestones table
-- =============================================================================
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_date date NOT NULL,
  description text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read milestones"
  ON milestones FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update milestones"
  ON milestones FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- 5. Seed milestones
-- =============================================================================
INSERT INTO milestones (name, target_date, description, status) VALUES
  ('60-Day Goal', '2026-05-31', 'Vox demo-ready for first external council, landing page live, IP separation complete', 'Active'),
  ('90-Day Goal', '2026-06-30', 'First pilot council signed, Adevus Pty Ltd incorporated, Beacon AI rebuild v1', 'Active'),
  ('6-Month Goal', '2026-10-31', '3 pilot councils live on Vox, DAM Studio external-ready, Echo wiring complete', 'Active'),
  ('12-Month Goal', '2027-04-30', 'Vox/DAM/Echo/Signal sellable, 8-10 councils on platform, first developer hired', 'Active');
