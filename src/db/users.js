const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = isProduction ?
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }) :
  new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "owasp",
    port: 5432,
  });

async function createUser({ email, password }) {
  try {
    const SQLQuery = {
      text: `INSERT INTO users (email, password) values ($1, $2) RETURNING *;`,
      values: [email, password]
    };

    const result = await pool.query(SQLQuery);

    return result.rows[0];
  } catch (e) {
    throw e;
  }
}

async function updateUserSecret({ email, secret }) {
  try {
    const SQLQuery = {
      text: `UPDATE users SET totp_secret = $2, failed_logins = 0 WHERE email = $1;`,
      values: [email, secret]
    };

    const result = await pool.query(SQLQuery);

    return result.rows[0];
  } catch (e) {
    throw e;
  }
}

async function updateFailedLogin(email) {
  try {
    const SQLQuery = {
      text: `UPDATE users SET failed_logins = failed_logins + 1, last_failed_login = NOW() WHERE email = $1;`,
      values: [email]
    };

    const result = await pool.query(SQLQuery);

    return result.rows[0];
  } catch (e) {
    throw e;
  }
}

async function deleteUser(email) {
  try {
    const SQLQuery = {
      text: `DELETE FROM users WHERE email = $1;`,
      values: [email]
    };

    await pool.query(SQLQuery);
  } catch (e) {
    throw e;
  }
}

async function getUserByEmail(email) {
  try {
    const SQLQuery = {
      text: `SELECT * FROM users WHERE email = $1;`,
      values: [email]
    };
    const { rows } = await pool.query(SQLQuery);
    if (rows.length === 0) {
      throw 'Credenciales inválidas';
    }
    return rows[0];
  } catch (e) {
    throw e;
  }
}

async function getUsers() {
  try {
    const SQLQuery = {
      text: "SELECT * FROM users",
    };
    const result = await pool.query(SQLQuery);
    return result.rows;
  } catch (e) {
    return e;
  }
}
module.exports = { createUser, updateUserSecret, updateFailedLogin, deleteUser, getUserByEmail, getUsers };
