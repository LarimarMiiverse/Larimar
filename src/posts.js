const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('moment/locale/fr');

const { paintingToPng } = require('./painting');

const PAINTINGS = path.join(__dirname, '..', 'media', 'paintings');
const MAX_BODY = 1000;
const POST_INTERVAL_SECONDS = 15;

// Announcement communities (type 2) are staff-only; min_perm gates the rest.
function canPost(account, community) {
    const level = account.permissions || 0;
    if (community.type === 2 && level < 1) return false;
    return level >= (community.min_perm || 0);
}

// The memo drawing as posted (base64 TGAZ, see painting.js) -> PNG, or null
function decodePainting(base64) {
    return paintingToPng(base64);
}

function savePainting(postId, png) {
    fs.mkdirSync(PAINTINGS, { recursive: true });
    fs.writeFileSync(path.join(PAINTINGS, postId + '.png'), png);
    return '/media/paintings/' + postId + '.png';
}

function timeAgo(date, lang) {
    return moment(date).locale(lang === 'fr' ? 'fr' : 'en').fromNow();
}

module.exports = { MAX_BODY, POST_INTERVAL_SECONDS, canPost, decodePainting, savePainting, timeAgo };
