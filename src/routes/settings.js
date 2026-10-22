const express = require('express');
const logger = require('../logger');
const { switchToJuxt } = require('../instance');

const router = express.Router();

router.get('/', async (req, res) => {
    res.render(req.directory + '/settings.ejs', { switched: false });
});

router.post('/instance', async (req, res) => {
    if (req.body.instance !== 'juxt') {
        return res.redirect('/settings');
    }

    try {
        await switchToJuxt(req.account.pid);
        res.render(req.directory + '/settings.ejs', { switched: true });
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: 'Error: ' + err });
    }
});

module.exports = router;
