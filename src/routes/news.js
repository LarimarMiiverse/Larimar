const express = require('express');

const router = express.Router();

router.get('/my_news', async (req, res) => {
    res.render(req.directory + '/news.ejs');
});

router.get('/friend_requests', async (req, res) => {
    res.render(req.directory + '/friend_requests.ejs');
});

module.exports = router;