const express = require('express');
const logger = require('../logger');
const { instanceSwitchEnabled, switchToJuxt } = require('../instance');
const { updateProfile } = require('../database');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.instanceSwitch = instanceSwitchEnabled;
    next();
});

router.get('/', async (req, res) => {
    res.render(req.directory + '/settings.ejs', { switched: false });
});

router.post('/profile', async (req, res) => {
    const comment = String(req.body.profile_comment || '').trim().slice(0, 400);
    const skill = ['0', '1', '2'].includes(req.body.game_skill) ? Number(req.body.game_skill) : null;

    try {
        await updateProfile(req.account.pid, comment || null, skill);
        res.redirect('/users/' + encodeURIComponent(req.account.user_id));
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: 'Error: ' + err });
    }
});

router.post('/instance', async (req, res) => {
    if (!instanceSwitchEnabled || req.body.instance !== 'juxt') {
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
