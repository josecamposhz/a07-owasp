-- CREATE DATABASE owasp;

CREATE TABLE insecure_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(60) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(60) UNIQUE NOT NULL,
    password VARCHAR(60) CHECK (length(password) >= 8),
    -- totp BOOLEAN DEFAULT TRUE,
    totp_secret VARCHAR(60),
    failed_logins INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP
);