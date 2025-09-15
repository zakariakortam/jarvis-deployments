-- Initial database setup and seed data for Mitsubishi Manufacturing Support System

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_status ON "Equipment" (status);
CREATE INDEX IF NOT EXISTS idx_equipment_department ON "Equipment" (department);
CREATE INDEX IF NOT EXISTS idx_equipment_critical_level ON "Equipment" ("criticalLevel");

CREATE INDEX IF NOT EXISTS idx_issues_status ON "Issues" (status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON "Issues" (severity);
CREATE INDEX IF NOT EXISTS idx_issues_equipment_id ON "Issues" ("equipmentId");
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON "Issues" ("createdAt");

CREATE INDEX IF NOT EXISTS idx_maintenance_status ON "MaintenanceTasks" (status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON "MaintenanceTasks" ("scheduledDate");
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON "MaintenanceTasks" ("equipmentId");

CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment_id ON "MaintenanceHistories" ("equipmentId");
CREATE INDEX IF NOT EXISTS idx_maintenance_history_start_time ON "MaintenanceHistories" ("startTime");

-- Seed data
INSERT INTO "Users" (
  id, username, email, password, "firstName", "lastName", role, department, "isActive", "createdAt", "updatedAt"
) VALUES 
-- Supervisors
(
  uuid_generate_v4(),
  'admin',
  'admin@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq', -- password123
  'Admin',
  'User',
  'supervisor',
  'Management',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'supervisor1',
  'supervisor@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq',
  'Sarah',
  'Johnson',
  'supervisor',
  'Assembly',
  true,
  NOW(),
  NOW()
),
-- Technicians
(
  uuid_generate_v4(),
  'tech1',
  'tech1@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq',
  'Mike',
  'Chen',
  'technician',
  'Assembly',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'tech2',
  'tech2@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq',
  'Lisa',
  'Rodriguez',
  'technician',
  'Machining',
  true,
  NOW(),
  NOW()
),
-- Operators
(
  uuid_generate_v4(),
  'op1',
  'operator1@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq',
  'John',
  'Smith',
  'operator',
  'Assembly',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'op2',
  'operator2@mitsubishi.com',
  '$2b$12$LQv3c1yqBwEHFgau71W5d.LY6o2MJ3pj4rUYoFp0RWgQ5EhqxV3tq',
  'Maria',
  'Garcia',
  'operator',
  'Quality Control',
  true,
  NOW(),
  NOW()
);

-- Sample Equipment Data
INSERT INTO "Equipment" (
  id, name, model, "serialNumber", location, department, status, 
  "installationDate", "criticalLevel", "isActive", "createdAt", "updatedAt"
) VALUES 
(
  uuid_generate_v4(),
  'Assembly Line Robot A1',
  'MIT-R2000',
  'MR20001',
  'Assembly Floor - Station 1',
  'Assembly',
  'operational',
  '2022-01-15',
  'high',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'CNC Machining Center',
  'MIT-CNC5000',
  'CNC50001',
  'Machining Bay 1',
  'Machining',
  'operational',
  '2021-06-10',
  'critical',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Quality Control Scanner',
  'MIT-QC3000',
  'QC30001',
  'QC Lab Station 1',
  'Quality Control',
  'maintenance',
  '2023-03-20',
  'medium',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Packaging Robot P1',
  'MIT-P1500',
  'MP15001',
  'Packaging Line 1',
  'Packaging',
  'operational',
  '2022-08-05',
  'medium',
  true,
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Industrial Compressor',
  'MIT-COMP800',
  'COMP80001',
  'Utility Room',
  'Maintenance',
  'down',
  '2020-12-01',
  'critical',
  true,
  NOW(),
  NOW()
);

-- Performance optimization: Create additional indexes after data insertion
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users" (role);
CREATE INDEX IF NOT EXISTS idx_users_department ON "Users" (department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "Users" ("isActive");

-- Create views for common queries
CREATE OR REPLACE VIEW equipment_summary AS
SELECT 
  e.id,
  e.name,
  e.model,
  e."serialNumber",
  e.location,
  e.department,
  e.status,
  e."criticalLevel",
  COUNT(DISTINCT CASE WHEN i.status IN ('open', 'in_progress') THEN i.id END) as open_issues_count,
  COUNT(DISTINCT CASE WHEN mt.status IN ('pending', 'in_progress') AND mt."scheduledDate" < NOW() THEN mt.id END) as overdue_tasks_count
FROM "Equipment" e
LEFT JOIN "Issues" i ON e.id = i."equipmentId"
LEFT JOIN "MaintenanceTasks" mt ON e.id = mt."equipmentId"
WHERE e."isActive" = true
GROUP BY e.id, e.name, e.model, e."serialNumber", e.location, e.department, e.status, e."criticalLevel";

-- Function to calculate equipment health score
CREATE OR REPLACE FUNCTION calculate_equipment_health_score(equipment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  health_score INTEGER := 100;
  issue_count INTEGER;
  overdue_count INTEGER;
  critical_issues INTEGER;
  equipment_status TEXT;
BEGIN
  -- Get equipment status
  SELECT status INTO equipment_status 
  FROM "Equipment" 
  WHERE id = equipment_id;
  
  -- Count open issues by severity
  SELECT COUNT(*) INTO critical_issues
  FROM "Issues" 
  WHERE "equipmentId" = equipment_id 
    AND status IN ('open', 'in_progress')
    AND severity IN ('critical', 'high');
  
  SELECT COUNT(*) INTO issue_count
  FROM "Issues" 
  WHERE "equipmentId" = equipment_id 
    AND status IN ('open', 'in_progress');
  
  -- Count overdue maintenance tasks
  SELECT COUNT(*) INTO overdue_count
  FROM "MaintenanceTasks"
  WHERE "equipmentId" = equipment_id 
    AND status IN ('pending', 'in_progress')
    AND "scheduledDate" < NOW();
  
  -- Calculate health score
  health_score := health_score - (critical_issues * 25) - (issue_count * 5) - (overdue_count * 10);
  
  -- Equipment status impact
  CASE equipment_status
    WHEN 'down' THEN health_score := health_score - 50;
    WHEN 'maintenance' THEN health_score := health_score - 20;
    ELSE health_score := health_score;
  END CASE;
  
  -- Ensure score is between 0 and 100
  IF health_score < 0 THEN health_score := 0; END IF;
  IF health_score > 100 THEN health_score := 100; END IF;
  
  RETURN health_score;
END;
$$ LANGUAGE plpgsql;