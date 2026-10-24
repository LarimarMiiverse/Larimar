const { pool } = require('../database');
const { exchangeServiceToken } = require('../account');
const logger = require('../logger');

async function authMiddleware(req, res, next) {
    let param_pack = req.headers['x-nintendo-parampack'];
    let service_token = req.headers['x-nintendo-servicetoken'];

    if (!service_token || !param_pack) {
        return res.status(401).send('service_token and param_pack are missing.');
    }

    service_token = service_token.trim();

    let base64Result;

    try {
        base64Result = Buffer.from(param_pack, 'base64')
            .toString()
            .slice(1, -1)
            .split('\\');
    } catch (err) {
        return res.status(400).send('Invalid ParamPack');
    }

    req.param_pack = {};
    req.service_token = service_token;

    for (let i = 0; i + 1 < base64Result.length; i += 2) {
        req.param_pack[base64Result[i].trim()] = base64Result[i + 1].trim();
    }

    let platform = parseInt(req.param_pack.platform_id); // 3ds = 0 wiiu = 1
    req.platform = platform === 0 ? '3ds' : 'wiiu';

    const user = await exchangeServiceToken(service_token);
    if (!user) {
        return res.status(401).send('Invalid service token.');
    }

    try {
        // Accounts are keyed by PID and created on the first visit, from the
        // PNID behind the service token (Revivetendo's account server).
        await pool.query(
            `INSERT INTO accounts (pid, screen_name, user_id, password, language, country)
             VALUES (?, ?, ?, '', ?, ?)
             ON DUPLICATE KEY UPDATE screen_name = VALUES(screen_name), updated_at = current_timestamp()`,
            [user.pid, (user.miiName || user.username).slice(0, 30), user.username, (user.language || 'en').slice(0, 8), (user.country || '').slice(0, 2) || null]
        );
        const [rows] = await pool.query('SELECT * FROM accounts WHERE pid = ?', [user.pid]);
        req.account = rows[0] || null;
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    if (!req.account) {
        return res.sendStatus(500);
    }

    next();
}

module.exports = { authMiddleware };
