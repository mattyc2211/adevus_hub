-- =============================================================================
-- Adevus Launchpad - Seed Data
-- =============================================================================
-- Run this after creating auth accounts for Matty and Paul.
-- Replace the placeholder UUIDs below with the actual auth.users UUIDs.
-- =============================================================================

-- IMPORTANT: Replace these with actual user UUIDs after signup
-- You can find them in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  matty_id uuid := '00000000-0000-0000-0000-000000000001'; -- REPLACE with Matty's auth UUID
  paul_id  uuid := '00000000-0000-0000-0000-000000000002'; -- REPLACE with Paul's auth UUID

  -- App IDs (generated here so items can reference them)
  app_vox uuid := gen_random_uuid();
  app_dam uuid := gen_random_uuid();
  app_beacon uuid := gen_random_uuid();
  app_meridian uuid := gen_random_uuid();
  app_insight uuid := gen_random_uuid();
  app_echo uuid := gen_random_uuid();
  app_signal uuid := gen_random_uuid();
  app_momentum uuid := gen_random_uuid();
  app_haven uuid := gen_random_uuid();
  app_aims uuid := gen_random_uuid();
  app_admin uuid := gen_random_uuid();
  app_rally uuid := gen_random_uuid();
  app_vigil uuid := gen_random_uuid();
  app_guardian uuid := gen_random_uuid();
  app_fleetbase uuid := gen_random_uuid();
  app_gate uuid := gen_random_uuid();
  app_procurehq uuid := gen_random_uuid();
  app_flowap uuid := gen_random_uuid();
  app_canopy uuid := gen_random_uuid();

BEGIN

-- =============================================================================
-- 1. PROFILES (will be auto-created by auth trigger, but seed just in case)
-- =============================================================================
INSERT INTO profiles (id, email, name, is_active) VALUES
  (matty_id, 'matty@adevus.com.au', 'Matty', true),
  (paul_id, 'paul@adevus.com.au', 'Paul', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. USER ROLES (both admins)
-- =============================================================================
INSERT INTO user_roles (user_id, role) VALUES
  (matty_id, 'admin'),
  (paul_id, 'admin')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. APPS (All 19 Adevus products)
-- =============================================================================
INSERT INTO apps (id, name, description, color_tag, status, priority_tier, category, product_status, owner) VALUES
  (app_vox,       'Vox',            'AI assistant platform with modular agents',                  '#0d9488', 'Active', 'P1',       'Communicate', 'Live',           'Both'),
  (app_dam,       'DAM Studio',     'Digital asset management system',                            '#6366f1', 'Active', 'P2',       'Communicate', 'In Development', 'Paul'),
  (app_beacon,    'Beacons',        'Service management platform (ServiceNow for local gov)',     '#f59e0b', 'Active', 'P3',       'Operate',     'Planned',        'Paul'),
  (app_meridian,  'Meridian',       'Financial management',                                       '#10b981', 'Active', 'P4',       'Operate',     'Planned',        'Paul'),
  (app_insight,   'Insight',        'Financial management / reporting',                           '#14b8a6', 'Active', 'P4',       'Operate',     'Planned',        'Paul'),
  (app_echo,      'Echo',           'Voice of Customer survey platform',                          '#8b5cf6', 'Active', 'P4',       'Engage',      'In Development', 'Matty'),
  (app_signal,    'Signal',         'Customer request management CRM',                            '#ec4899', 'Active', 'Active',   'Engage',      'Near Go-Live',   'Both'),
  (app_momentum,  'Momentum',       'Project management (Monday.com for local gov)',              '#f97316', 'Active', 'Active',   'Deliver',     'In Development', 'Paul'),
  (app_haven,     'Haven',          'Cemetery management',                                        '#78716c', 'Active', 'Active',   'Specialist',  'In Development', 'Paul'),
  (app_aims,      'AIMS',           'TBC - Paul has details',                                     '#64748b', 'Active', 'Active',   'Operate',     'In Development', 'Paul'),
  (app_admin,     'Adevus Admin',   'Platform administration layer',                              '#1e3a5f', 'Active', 'Active',   'Operate',     'In Development', 'Both'),
  (app_rally,     'Rally',          'TBC',                                                        '#94a3b8', 'Active', 'Pipeline', NULL,          'Pipeline',       'Paul'),
  (app_vigil,     'Vigil',          'TBC',                                                        '#94a3b8', 'Active', 'Pipeline', 'Operate',     'Pipeline',       'Paul'),
  (app_guardian,  'Guardian',       'TBC',                                                        '#94a3b8', 'Active', 'Pipeline', NULL,          'Pipeline',       'Paul'),
  (app_fleetbase, 'Fleetbase',     'Fleet management',                                           '#94a3b8', 'Active', 'Pipeline', 'Operate',     'Pipeline',       'Paul'),
  (app_gate,      'Gate',           'Compliance/gate management',                                 '#94a3b8', 'Active', 'Pipeline', 'Operate',     'Pipeline',       'Paul'),
  (app_procurehq, 'Procure HQ',   'Procurement management',                                     '#94a3b8', 'Active', 'Pipeline', 'Operate',     'Pipeline',       'Paul'),
  (app_flowap,    'Flow AP',       'Accounts payable & sub-modules (Roster, Timesheet, etc.)',   '#94a3b8', 'Active', 'Pipeline', 'Operate',     'Pipeline',       'Paul'),
  (app_canopy,    'Canopy',         'Not-for-profit vertical',                                    '#22c55e', 'Active', 'NFP',      'NFP',         'Pipeline',       'Both');

-- =============================================================================
-- 4. ITEMS - Roadmap: 60-Day Goals (May 2026)
-- =============================================================================
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, roadmap_milestone, description) VALUES
  (app_vox,    'Demo-ready for first external council',                'Feature',  'Critical', 'In Progress', 'Both',       matty_id, 'Both',  '60-day', 'Vox must be polished and demo-ready for showing to external councils'),
  (app_vox,    'Set up clean demo environment',                        'Feature',  'High',     'Idea',        'Matty',      matty_id, 'Matty', '60-day', 'Council-agnostic demo environment with sample data'),
  (app_vox,    'Upload correct policy docs to HR/PSP modules',         'Feature',  'High',     'Idea',        'Matty',      matty_id, 'Matty', '60-day', 'Users are hitting limits because of incorrect policy docs'),
  (app_vox,    'IT Helpdesk module build',                             'Feature',  'High',     'Idea',        'Paul',       paul_id,  'Paul',  '60-day', 'Specced and ready to build'),
  (app_vox,    'Landing page live on adevus.com.au',                   'Feature',  'Medium',   'Idea',        'Matty',      matty_id, 'Matty', '60-day', 'Marketing landing page for Vox product'),
  (app_admin,  'IP separation - move code to Adevus GitHub org',       'Decision', 'Critical', 'Idea',        'Paul',       paul_id,  'Paul',  '60-day', 'All code needs to be moved from PMHCouncil to Adevus org'),
  (app_vox,    'Progress at least 1 warm council to demo conversation','Feature',  'High',     'Idea',        'Matty',      matty_id, 'Matty', '60-day', 'Sales pipeline - get at least one council interested'),
  (app_dam,    'Custom domain setup (pending ACM cert)',               'Feature',  'Medium',   'Blocked',     'Paul',       paul_id,  'Paul',  '60-day', 'Blocked: waiting on ACM certificate from IT'),
  (app_beacon, 'Email pipeline (pending AWS SES verification)',        'Feature',  'Medium',   'Blocked',     'Paul',       paul_id,  'Paul',  '60-day', 'Blocked: waiting on AWS SES domain verification from IT');

-- =============================================================================
-- 5. ITEMS - Roadmap: 90-Day Goals (June 2026)
-- =============================================================================
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, roadmap_milestone, description) VALUES
  (app_vox,    'First pilot council signed for Vox',                   'Decision', 'Critical', 'Idea',        'Both',       matty_id, 'Both',  '90-day', 'First paying/pilot customer'),
  (app_admin,  'Adevus Pty Ltd incorporated',                         'Decision', 'Critical', 'Idea',        'Matty',      matty_id, 'Matty', '90-day', 'Legal incorporation of the company'),
  (app_admin,  'Shareholders agreement and IP deed executed',          'Decision', 'Critical', 'Idea',        'Matty',      matty_id, 'Matty', '90-day', 'Legal foundations for the partnership'),
  (app_beacon, 'AI rebuild v1 complete',                               'Feature',  'High',     'Idea',        'Paul',       paul_id,  'Paul',  '90-day', 'Beacon AI rebuild first version'),
  (app_admin,  'NSW MVP Ventures application submitted',               'Feature',  'Medium',   'Idea',        'Matty',      matty_id, 'Matty', '90-day', 'Funding application');

-- =============================================================================
-- 6. ITEMS - Roadmap: 6-Month Goals (October 2026)
-- =============================================================================
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, roadmap_milestone, description) VALUES
  (app_vox,    '3 pilot councils live on Vox',                         'Feature',  'Critical', 'Idea',        'Both',       matty_id, 'Both',  '6-month', 'Scale from 1 to 3 councils'),
  (app_dam,    'Ready for first external customer',                    'Feature',  'High',     'Idea',        'Paul',       paul_id,  'Paul',  '6-month', 'DAM Studio production-ready for external use'),
  (app_beacon, 'Internal pilot with PMHC',                            'Feature',  'High',     'Idea',        'Paul',       paul_id,  'Paul',  '6-month', 'First internal pilot of Beacon service management'),
  (app_admin,  'R&D Tax Incentive claim prepared',                    'Decision', 'Medium',   'Idea',        'Matty',      matty_id, 'Matty', '6-month', 'Tax incentive preparation'),
  (app_echo,   'Supabase wiring complete',                             'Feature',  'High',     'Idea',        'Matty',      matty_id, 'Matty', '6-month', 'Full backend integration for Echo');

-- =============================================================================
-- 7. ITEMS - Roadmap: 12-Month Goals (April 2027)
-- =============================================================================
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, roadmap_milestone, description) VALUES
  (app_vox,    'Vox, DAM Studio, Echo, Signal live and sellable',      'Feature',  'Critical', 'Idea',        'Both',       matty_id, 'Both',  '12-month', '4 products fully live and commercially available'),
  (app_beacon, 'Beacon in external pilot',                             'Feature',  'High',     'Idea',        'Both',       paul_id,  'Both',  '12-month', 'Beacon being tested by external council'),
  (app_admin,  '8-10 councils on the platform',                       'Feature',  'Critical', 'Idea',        'Both',       matty_id, 'Both',  '12-month', 'Target customer count'),
  (app_admin,  'First developer hired',                                'Decision', 'High',     'Idea',        'Both',       matty_id, 'Both',  '12-month', 'Scale the team'),
  (app_gate,   'Gate build started',                                   'Feature',  'Medium',   'Idea',        'Paul',       paul_id,  'Paul',  '12-month', 'Simpler product, high compliance value');

-- =============================================================================
-- 8. ITEMS - Current "Now" work (April 2026, no milestone)
-- =============================================================================
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, description, is_blocker, dependency) VALUES
  (app_admin,  'Multi-tenancy architecture',                           'Feature',  'Critical', 'In Progress', 'Paul',       paul_id,  'Paul',  'Core architecture for serving multiple councils from one deployment', true, 'Blocks all external sales'),
  (app_haven,  'Haven M4: Cemetery & Section Setup',                   'Feature',  'Medium',   'Idea',        'Paul',       paul_id,  'Paul',  'Next milestone in Haven development after M0-M3', false, NULL),
  (app_echo,   'Survey Builder and survey import',                     'Feature',  'High',     'In Progress', 'Matty',      matty_id, 'Matty', 'Core Echo feature - building the survey creation tool', false, NULL),
  (app_vox,    'Discuss vector search upgrade for Vox',                'Decision', 'Medium',   'Idea',        'Both',       matty_id, 'Both',  'Full-text search working well, semantic search planned', false, NULL),
  (app_vox,    'Vox internal pilot live at PMHC (DT team)',            'Deployment','Low',     'Deployed',    'Both',       matty_id, 'Both',  'Launched 1 April 2026, group managers now using it', false, NULL),
  (app_vox,    'Vox demoed to SLT by Paul',                           'Deployment','Low',     'Deployed',    'Paul',       paul_id,  'Paul',  'Senior Leadership Team demo complete', false, NULL);

-- =============================================================================
-- 9. ITEMS - Security Remediation (from Vox Go-Live Audit)
-- =============================================================================

-- Critical severity (9 items)
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, security_severity, description) VALUES
  (app_vox, 'JWT verification OFF on all 13 Edge Functions',           'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Enable verify_jwt = true one function at a time using the CORS + getUser() pattern'),
  (app_vox, 'Chat endpoint trusts body params for identity',          'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Extract userId/userEmail from JWT via getUser() instead of request body'),
  (app_vox, 'Profile export publicly accessible',                     'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Add auth check via getUser() to export-user-profile'),
  (app_vox, 'ROI report no auth',                                     'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Add auth check + admin role verification to generate-roi-report'),
  (app_vox, 'Analyse profile no auth',                                'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Add auth check to analyse-user-profile'),
  (app_vox, 'CORS wildcard on all functions',                         'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Replace * with https://vox.adevus.com.au or allowlist'),
  (app_vox, 'Public endpoints that write to DB',                      'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Add auth to classify-output, generate-pdf, generate-excel'),
  (app_vox, 'Bootstrap admin race condition',                         'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Wrap first-user check in a database transaction'),
  (app_vox, 'HTML-to-PDF without sanitization',                       'Security', 'Critical', 'Idea', 'Paul', paul_id, 'Paul', 'Critical', 'Sanitize HTML input before sending to PDFShift (prevent SSRF/XXE)');

-- High severity (5 items)
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, security_severity, description) VALUES
  (app_vox, 'No rate limiting on most endpoints',                     'Security', 'High', 'Idea', 'Paul', paul_id, 'Paul', 'High', 'Add rate limiting to chat, process-document, generate-* functions'),
  (app_vox, '23 console.log statements in Edge Functions',            'Security', 'High', 'Idea', 'Paul', paul_id, 'Paul', 'High', 'Remove or replace with structured logging'),
  (app_vox, 'No error monitoring',                                     'Security', 'High', 'Idea', 'Both', paul_id, 'Both', 'High', 'Set up Sentry for frontend; CloudWatch alerts for Edge Functions'),
  (app_vox, 'No tests',                                                'Security', 'High', 'Idea', 'Both', paul_id, 'Both', 'High', 'Write core tests: auth flow, chat, document upload, admin CRUD'),
  (app_vox, '5 npm vulnerabilities remaining',                        'Security', 'High', 'Idea', 'Paul', paul_id, 'Paul', 'High', 'Upgrade Vite to latest major version');

-- Medium severity (4 items)
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, security_severity, description) VALUES
  (app_vox, 'Large bundle sizes (main 945KB, vendor-excel 938KB)',    'Security', 'Medium', 'Idea', 'Paul', paul_id, 'Paul', 'Medium', 'Code-split and lazy-load vendor-excel and vendor-syntax'),
  (app_vox, 'TypeScript strict mode disabled (533 lint errors)',      'Security', 'Medium', 'Idea', 'Paul', paul_id, 'Paul', 'Medium', 'Enable incrementally, fix any types'),
  (app_vox, 'Document preview errors logged to console only',         'Security', 'Medium', 'Idea', 'Paul', paul_id, 'Paul', 'Medium', 'Add user-facing error toasts'),
  (app_vox, 'Audit log exists but no admin UI',                       'Security', 'Medium', 'Idea', 'Matty', matty_id, 'Matty', 'Medium', 'Build admin audit log viewer page');

-- Low severity (3 items)
INSERT INTO items (app_id, title, type, priority, status, assignee, created_by, owner, security_severity, description) VALUES
  (app_vox, 'Conversation rename uses window.prompt()',               'Security', 'Low', 'Idea', 'Paul', paul_id, 'Paul', 'Low', 'Replace with Dialog component'),
  (app_vox, '404 page logs to console.error',                        'Security', 'Low', 'Idea', 'Paul', paul_id, 'Paul', 'Low', 'Remove or sanitize'),
  (app_vox, 'Browserslist data outdated',                             'Security', 'Low', 'Idea', 'Paul', paul_id, 'Paul', 'Low', 'Run npx update-browserslist-db@latest');

END $$;
