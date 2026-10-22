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
    'SELECT pid, user_id, screen_name, country, profile_comment, game_skill FROM accounts WHERE user_id = ?',
    [user_id]
  );

  return rows[0] || null;
}

async function updateProfile(pid, profile_comment, game_skill) {
  await pool.query(
    'UPDATE accounts SET profile_comment = ?, game_skill = ? WHERE pid = ?',
    [profile_comment, game_skill, pid]
  );
}

async function getFollowCounts(pid) {
  const [rows] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM follows WHERE follower_pid = ?) AS following,
      (SELECT COUNT(*) FROM follows WHERE followee_pid = ?) AS followers`,
    [pid, pid]
  );

  return rows[0];
}

async function isFollowing(follower_pid, followee_pid) {
  const [rows] = await pool.query(
    'SELECT 1 FROM follows WHERE follower_pid = ? AND followee_pid = ?',
    [follower_pid, followee_pid]
  );

  return rows.length > 0;
}

async function follow(follower_pid, followee_pid) {
  await pool.query(
    'INSERT IGNORE INTO follows (follower_pid, followee_pid) VALUES (?, ?)',
    [follower_pid, followee_pid]
  );
}

async function unfollow(follower_pid, followee_pid) {
  await pool.query(
    'DELETE FROM follows WHERE follower_pid = ? AND followee_pid = ?',
    [follower_pid, followee_pid]
  );
}

// tab is 'following' (users pid follows) or 'followers' (users following pid)
async function getFollowList(pid, tab) {
  const [mine, theirs] = tab === 'following' ? ['follower_pid', 'followee_pid'] : ['followee_pid', 'follower_pid'];
  const [rows] = await pool.query(
    `SELECT a.pid, a.user_id, a.screen_name, a.profile_comment
     FROM follows f JOIN accounts a ON a.pid = f.${theirs}
     WHERE f.${mine} = ?
     ORDER BY f.created_at DESC
     LIMIT 100`,
    [pid]
  );

  return rows;
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
  updateProfile,
  getFollowCounts,
  isFollowing,
  follow,
  unfollow,
  getFollowList,
  getAllCommunities,
  getCommunityById
};