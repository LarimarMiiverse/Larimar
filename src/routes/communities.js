const express = require('express');
const logger = require('../logger');
const { CATEGORIES } = require('../categories');
const {
    getCommunities,
    getCommunityById,
    getFavoriteCommunities,
    isFavoriteCommunity,
    setFavoriteCommunity
} = require('../database');

// Mounted at both /communities and /titles.
const router = express.Router();

function renderError(req, res, code, message) {
    res.status(code).render(req.directory + '/error.ejs', { code, message });
}

async function renderList(req, res, options, extra) {
    try {
        const communities = await getCommunities(options);
        res.render(req.directory + '/communities.ejs', { communities, categories: CATEGORIES, ...extra });
    } catch (err) {
        logger.error(err);
        renderError(req, res, 500, 'Error: ' + err);
    }
}

router.get('/', (req, res) => renderList(req, res, {}, { category: null, query: null }));

router.get('/categories/:category', (req, res, next) => {
    if (!CATEGORIES.includes(req.params.category)) return next();
    renderList(req, res, { category: req.params.category }, { category: req.params.category, query: null });
});

// The original portal script sends community searches to /titles/search
router.get('/search', (req, res) => {
    const query = String(req.query.query || '').trim().slice(0, 20);
    renderList(req, res, { search: query }, { category: null, query });
});

router.get('/favorites', async (req, res) => {
    try {
        const communities = await getFavoriteCommunities(req.account.pid);
        res.render(req.directory + '/fav_communities.ejs', { communities });
    } catch (err) {
        logger.error(err);
        renderError(req, res, 500, 'Error: ' + err);
    }
});

// Community pages must stay at /titles/<number>/<number>: that's where the
// original portal script sets up the favorite button.
const COMMUNITY_PATH = '/:olive_title_id/:olive_community_id';

async function findCommunity(req, res) {
    const { olive_title_id, olive_community_id } = req.params;
    if (!/^\d+$/.test(olive_title_id) || !/^\d+$/.test(olive_community_id)) return null;
    return getCommunityById(olive_title_id, olive_community_id);
}

router.get(COMMUNITY_PATH, async (req, res, next) => {
    try {
        const community = await findCommunity(req, res);
        if (!community) return renderError(req, res, 404, 'Community not found');

        const favorite = await isFavoriteCommunity(req.account.pid, community.community_id);
        res.render(req.directory + '/page_community.ejs', { title: community.name, community, favorite });
    } catch (err) {
        logger.error(err);
        renderError(req, res, 500, 'Error: ' + err);
    }
});

// Called by the original portal script's favorite (☆) button
async function changeFavorite(req, res, favorite) {
    try {
        const community = await findCommunity(req, res);
        if (!community) return res.status(404).json({ success: 0 });

        await setFavoriteCommunity(req.account.pid, community.community_id, favorite);
        res.json({ success: 1 });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: 0 });
    }
}

router.post(COMMUNITY_PATH + '/favorite', (req, res) => changeFavorite(req, res, true));
router.post(COMMUNITY_PATH + '/unfavorite', (req, res) => changeFavorite(req, res, false));

module.exports = router;
