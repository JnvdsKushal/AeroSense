-- PostgreSQL schema for AeroSense
-- Neon PostgreSQL deployment

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aircraft (
    id BIGSERIAL PRIMARY KEY,
    aircraft_uuid TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS components (
    id BIGSERIAL PRIMARY KEY,
    component_uuid TEXT UNIQUE NOT NULL,
    aircraft_id BIGINT REFERENCES aircraft(id) ON DELETE SET NULL,
    serial_number TEXT UNIQUE NOT NULL,
    component_type TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS component_tags (
    id BIGSERIAL PRIMARY KEY,
    component_id BIGINT NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    identifier TEXT UNIQUE NOT NULL,
    security_type TEXT NOT NULL,
    tamper_status TEXT NOT NULL DEFAULT 'INTACT',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    component_id BIGINT NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    technician_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    maintenance_type TEXT NOT NULL,
    description TEXT NOT NULL,
    parts_replaced TEXT,
    inspection_result TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_logs (
    id BIGSERIAL PRIMARY KEY,
    component_id BIGINT REFERENCES components(id) ON DELETE SET NULL,
    tag_id BIGINT REFERENCES component_tags(id) ON DELETE SET NULL,
    authentication_result BOOLEAN NOT NULL,
    component_binding_result BOOLEAN NOT NULL,
    tamper_result BOOLEAN NOT NULL,
    blockchain_result BOOLEAN NOT NULL,
    final_result TEXT NOT NULL,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE aircraft
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE components
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE component_tags
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE maintenance_records
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE verification_logs
    ADD COLUMN IF NOT EXISTS company_id BIGINT
    REFERENCES companies(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS blockchain_records (
    record_id BIGINT PRIMARY KEY
        REFERENCES maintenance_records(id) ON DELETE CASCADE,
    onchain_hash TEXT NOT NULL,
    stored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_uuid
    ON users(uuid);

CREATE INDEX IF NOT EXISTS idx_aircraft_uuid
    ON aircraft(aircraft_uuid);

CREATE INDEX IF NOT EXISTS idx_aircraft_reg
    ON aircraft(registration_number);

CREATE INDEX IF NOT EXISTS idx_components_uuid
    ON components(component_uuid);

CREATE INDEX IF NOT EXISTS idx_components_serial
    ON components(serial_number);

CREATE INDEX IF NOT EXISTS idx_components_aircraft
    ON components(aircraft_id);

CREATE INDEX IF NOT EXISTS idx_tags_identifier
    ON component_tags(identifier);

CREATE INDEX IF NOT EXISTS idx_tags_component
    ON component_tags(component_id);

CREATE INDEX IF NOT EXISTS idx_maint_component
    ON maintenance_records(component_id);

CREATE INDEX IF NOT EXISTS idx_verification_component
    ON verification_logs(component_id);

CREATE INDEX IF NOT EXISTS idx_companies_slug
    ON companies(slug);

CREATE INDEX IF NOT EXISTS idx_users_company
    ON users(company_id);

CREATE INDEX IF NOT EXISTS idx_aircraft_company
    ON aircraft(company_id);

CREATE INDEX IF NOT EXISTS idx_components_company
    ON components(company_id);

CREATE INDEX IF NOT EXISTS idx_tags_company
    ON component_tags(company_id);

CREATE INDEX IF NOT EXISTS idx_maint_company
    ON maintenance_records(company_id);

CREATE INDEX IF NOT EXISTS idx_verification_company
    ON verification_logs(company_id);