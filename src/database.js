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

const COMMUNITY_COLUMNS = `c.*,
  (SELECT COUNT(*) FROM community_favorites f WHERE f.community_id = c.community_id) AS favorite_count`;

// Visible communities, optionally of one category or matching a name search
async function getCommunities({ category, search } = {}) {
  const where = ['(c.hidden IS NULL OR c.hidden = 0)'];
  const params = [];

  if (category) {
    where.push('c.category = ?');
    params.push(category);
  }
  if (search) {
    // The table's utf8mb4_bin collation would make LIKE case-sensitive
    where.push('c.name COLLATE utf8mb4_general_ci LIKE ?');
    params.push('%' + search.replace(/[\\%_]/g, '\\$&') + '%');
  }

  const [rows] = await pool.query(
    `SELECT ${COMMUNITY_COLUMNS} FROM communities c WHERE ${where.join(' AND ')} ORDER BY c.sort_order, c.name`,
    params
  );

  return rows;
}

async function getAllCommunities() {
  return getCommunities();
}

// Community pages live at /titles/<olive_title_id>/<olive_community_id>; the
// community ID alone identifies it (for topic communities both are the same).
async function getCommunityById(olive_title_id, olive_community_id) {
  const [rows] = await pool.query(
    `SELECT ${COMMUNITY_COLUMNS} FROM communities c WHERE c.olive_community_id = ?`,
    [olive_community_id]
  );

  return rows[0] || null;
}

async function getFavoriteCommunities(pid) {
  const [rows] = await pool.query(
    `SELECT ${COMMUNITY_COLUMNS} FROM communities c
     JOIN community_favorites fav ON fav.community_id = c.community_id AND fav.pid = ?
     WHERE (c.hidden IS NULL OR c.hidden = 0)
     ORDER BY fav.created_at DESC`,
    [pid]
  );

  return rows;
}

async function isFavoriteCommunity(pid, community_id) {
  const [rows] = await pool.query(
    'SELECT 1 FROM community_favorites WHERE pid = ? AND community_id = ?',
    [pid, community_id]
  );

  return rows.length > 0;
}

async function setFavoriteCommunity(pid, community_id, favorite) {
  if (favorite) {
    await pool.query('INSERT IGNORE INTO community_favorites (pid, community_id) VALUES (?, ?)', [pid, community_id]);
  } else {
    await pool.query('DELETE FROM community_favorites WHERE pid = ? AND community_id = ?', [pid, community_id]);
  }
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
  getCommunities,
  getAllCommunities,
  getCommunityById,
  getFavoriteCommunities,
  isFavoriteCommunity,
  setFavoriteCommunity
};