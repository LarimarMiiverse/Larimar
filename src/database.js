const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL Database connected!');
    connection.release();
  } catch (err) {
    logger.error('MySQL Connection Error: ' + err.message);
  }
}

async function getUserById(user_id) {
  const [rows] = await pool.query(
    'SELECT user_id, screen_name FROM accounts WHERE user_id = ?',
    [user_id]
  );

  return rows[0] || null;
}

async function getAllCommunities() {
  const [rows] = await pool.query(
    'SELECT * FROM communities ORDER BY created_at DESC'
  );

  return rows;
}

async function getCommunityById(olive_title_id, olive_community_id) {
  const [rows] = await pool.query(
    'SELECT * FROM communities WHERE olive_title_id = ? AND olive_community_id = ?',
    [olive_title_id, olive_community_id]
  );

  return rows[0] || null;
}

module.exports = {
  pool,
  connectDB,
  getUserById,
  getAllCommunities,
  getCommunityById
};