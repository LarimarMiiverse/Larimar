const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
    res.render(req.directory + '/activity.ejs');
});

router.get('/welcome', async (req, res) => {
    res.render(req.directory + '/welcome/welcome.ejs');
});

module.exports = router;