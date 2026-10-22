const express = require('express');
const logger = require('../logger');
const { getCommunityById, getAllCommunities } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const communities = await getAllCommunities();

        return res.render(req.directory + '/communities.ejs', { communities });
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: "Error: " + err });
    }
});

router.get('/favorites', async (req, res) => {
    res.render(req.directory + "/fav_communities.ejs");
});

router.get('/:olive_title_id/:olive_community_id', async (req, res) => {
    const { olive_title_id, olive_community_id } = req.params;

    try {
        const community = await getCommunityById(
            olive_title_id,
            olive_community_id
        );

        if (!community) {
            return res.status(404).render(req.directory + '/error.ejs', { code: 404, message: 'Community not found' });
        }

        return res.render(req.directory + '/page_community.ejs', { community });
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: 'Error: ' + err });
    }
});

module.exports = router;