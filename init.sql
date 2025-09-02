-- BrainSAIT LincCore Database Initialization
-- HIPAA-compliant database schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS brainsait_linccore;

-- Use the database
\c brainsait_linccore;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive',
    capabilities JSONB,
    websocket_endpoint VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    parameters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FHIR resources table (HIPAA compliant)
CREATE TABLE IF NOT EXISTS fhir_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table (HIPAA requirement)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fhir_resources_type_date 
ON fhir_resources (resource_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_timestamp
ON audit_logs (user_id, timestamp DESC) 
WHERE action_type = 'phi_access';

-- Insert default agents
INSERT INTO agents (name, type, capabilities, websocket_endpoint) VALUES
('masterlinc', 'orchestration', '["workflow", "coordination", "routing"]', 'ws://localhost:8001/agents/masterlinc'),
('healthcarelinc', 'healthcare', '["fhir", "clinical-workflows", "nphies"]', 'ws://localhost:8001/agents/healthcare'),
('ttlinc', 'automation', '["task-scheduling", "workflow-automation"]', 'ws://localhost:8001/agents/automation'),
('clinicallinc', 'clinical', '["clinical-decision-support", "patient-data"]', 'ws://localhost:8001/agents/clinical'),
('compliancelinc', 'compliance', '["audit", "encryption", "access-control"]', 'ws://localhost:8001/agents/compliance')
ON CONFLICT (name) DO NOTHING;

-- Insert default tools
INSERT INTO tools (name, category, description, parameters) VALUES
('fhir_validator', 'healthcare', 'Validate FHIR R4 resources with NPHIES compliance', '{"resource_type": "string", "resource_data": "object"}'),
('code_formatter', 'development', 'Format code with healthcare standards', '{"code": "string", "language": "string"}'),
('security_scanner', 'security', 'HIPAA-compliant security scanning', '{"target": "string", "scan_type": "string"}'),
('compliance_checker', 'compliance', 'Validate HIPAA and NPHIES compliance', '{"resource": "object", "standard": "string"}')
ON CONFLICT (name) DO NOTHING;
