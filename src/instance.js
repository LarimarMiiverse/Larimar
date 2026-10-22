const { createClient } = require('redis');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

// Which Miiverse a console opens is the only thing Larimar shares with Juxt:
// Juxt's discovery reads this key. No key means Juxt, so losing it is safe.
const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (err) => logger.error('Redis: ' + err.message));
redis.connect().catch(() => {});

const key = (pid) => `miiverse:instance:${pid}`;

async function switchToJuxt(pid) {
  await redis.del(key(pid));
}

module.exports = { switchToJuxt };
