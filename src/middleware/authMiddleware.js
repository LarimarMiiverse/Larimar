const { pool } = require('../database');
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

    for (let i = 0; i < base64Result.length; i += 2) {
        req.param_pack[base64Result[i].trim()] = base64Result[i + 1].trim();
    }

    let platform = parseInt(req.param_pack.platform_id); // 3ds = 0 wiiu = 1
    let account;

    try {
        if (platform === 0) {
            req.platform = '3ds';
            const [rows] = await pool.query(
                'SELECT * FROM accounts WHERE service_token_3ds = ?',
                [service_token]
            );
            account = rows;
        } else {
            req.platform = 'wiiu';
            const [rows] = await pool.query(
                'SELECT * FROM accounts WHERE service_token_wiiu = ?',
                [service_token]
            );
            account = rows;
        }
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    req.account = account?.[0] || null;

    // If you don't have an account, go to welcome page
    if (!req.account) {
        if (req.path === '/welcome') return next();
        return res.redirect(302, '/welcome');
    }

    next();
}

module.exports = { authMiddleware };