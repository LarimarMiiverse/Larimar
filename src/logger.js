const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  success: '\x1b[32m'
};

function getTime() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

function log(level, color, message) {
  console.log(
    `${color}[${getTime()}] [${level}] ${message}${colors.reset}`
  );
}

module.exports = {
  info: (msg) => log('INFO', colors.info, msg),
  warn: (msg) => log('WARN', colors.warn, msg),
  error: (msg) => log('ERROR', colors.error, msg),
  success: (msg) => log('SUCCESS', colors.success, msg),
};