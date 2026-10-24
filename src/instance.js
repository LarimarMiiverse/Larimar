const { createClient } = require('redis');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

// Optional: when Larimar runs next to Juxt (as on Revivetendo), Juxt's
// discovery decides per player which Miiverse a console opens, from the Redis
// key miiverse:instance:<pid>. No key means Juxt. Set REDIS_URL to show the
// "Switch back to Juxt" option; without it there is no switch at all.
const enabled = Boolean(process.env.REDIS_URL);

let redis = null;
if (enabled) {
  redis = createClient({ url: process.env.REDIS_URL });
  redis.on('error', (err) => logger.error('Redis: ' + err.message));
  redis.connect().catch(() => {});
}

const key = (pid) => `miiverse:instance:${pid}`;

async function switchToJuxt(pid) {
  await redis.del(key(pid));
}

module.exports = { instanceSwitchEnabled: enabled, switchToJuxt };
