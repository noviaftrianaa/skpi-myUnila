-- =====================================================
-- PostgreSQL Init Script — Local Development
-- Creates databases + users for all PG services
-- Runs automatically on first docker postgres start
-- =====================================================

-- Project Management
CREATE USER myunila_pm WITH PASSWORD 'myunila_pm_local';
CREATE DATABASE myunila_project OWNER myunila_pm;
GRANT ALL PRIVILEGES ON DATABASE myunila_project TO myunila_pm;

-- SIMBAK (SI MBAK)
CREATE USER myunila_bak WITH PASSWORD 'myunila_bak_local';
CREATE DATABASE simbak OWNER myunila_bak;
GRANT ALL PRIVILEGES ON DATABASE simbak TO myunila_bak;

-- SI KKN (future)
CREATE USER myunila_kkn WITH PASSWORD 'myunila_kkn_local';
CREATE DATABASE siknila OWNER myunila_kkn;
GRANT ALL PRIVILEGES ON DATABASE siknila TO myunila_kkn;
