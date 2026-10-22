const express = require('express');
const logger = require('../logger');
const { getUserById } = require('../database');

const router = express.Router();

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const user = await getUserById(user_id);

        if (!user) {
            return res.status(404).render(req.directory + '/error.ejs', { code: 404, message: 'User not found' });
        }

        const own_profile = req.account.user_id === user_id;

        res.render(req.directory + '/users.ejs', { user, own_profile });
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: 'Error: ' + err });
    }
});

module.exports = router;