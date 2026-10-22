const express = require('express');
const logger = require('../logger');
const { getUserById, getFollowCounts, isFollowing, follow, unfollow, getFollowList } = require('../database');

const router = express.Router();

const TABS = ['posts', 'following', 'followers'];

function regionName(code, lang) {
    if (!code) return null;
    try {
        return new Intl.DisplayNames([lang], { type: 'region' }).of(code);
    } catch (err) {
        return code;
    }
}

async function renderUserPage(req, res, tab) {
    const { user_id } = req.params;

    try {
        const user = await getUserById(user_id);

        if (!user) {
            return res.status(404).render(req.directory + '/error.ejs', { code: 404, message: 'User not found' });
        }

        const own_profile = req.account.pid === user.pid;
        const [counts, following, list] = await Promise.all([
            getFollowCounts(user.pid),
            own_profile ? false : isFollowing(req.account.pid, user.pid),
            tab === 'posts' ? [] : getFollowList(user.pid, tab)
        ]);

        res.render(req.directory + '/users.ejs', {
            title: user.screen_name,
            user,
            own_profile,
            tab,
            counts,
            following,
            list,
            region: regionName(user.country, res.locals.local)
        });
    } catch (err) {
        logger.error(err);
        res.status(500).render(req.directory + '/error.ejs', { code: 500, message: 'Error: ' + err });
    }
}

router.get('/:user_id', (req, res) => renderUserPage(req, res, 'posts'));

router.get('/:user_id/:tab', (req, res, next) => {
    if (!TABS.includes(req.params.tab)) return next();
    renderUserPage(req, res, req.params.tab);
});

// Called by the original portal script's follow buttons (data-action), which
// expect JSON back.
async function changeFollow(req, res, followIt) {
    try {
        const user = await getUserById(req.params.user_id);

        if (!user || user.pid === req.account.pid) {
            return res.status(400).json({ success: 0 });
        }

        if (followIt) {
            await follow(req.account.pid, user.pid);
        } else {
            await unfollow(req.account.pid, user.pid);
        }

        // Unfollow is a plain form post: send the page back instead of JSON.
        if (!req.xhr) {
            return res.redirect('/users/' + encodeURIComponent(user.user_id));
        }

        const counts = await getFollowCounts(req.account.pid);
        res.json({ success: 1, following_count: counts.following, can_follow_more: true });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ success: 0 });
    }
}

router.post('/:user_id/follow', (req, res) => changeFollow(req, res, true));
router.post('/:user_id/unfollow', (req, res) => changeFollow(req, res, false));

module.exports = router;
