const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('moment/locale/fr');

const PAINTINGS = path.join(__dirname, '..', 'media', 'paintings');
const MAX_BODY = 1000;
const POST_INTERVAL_SECONDS = 15;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Announcement communities (type 2) are staff-only; min_perm gates the rest.
function canPost(account, community) {
    const level = account.permissions || 0;
    if (community.type === 2 && level < 1) return false;
    return level >= (community.min_perm || 0);
}

// The Wii U memo hands over a base64 PNG (wiiuMemo.getImage(false)), 320x120.
// Returns the decoded PNG, or null if it isn't a small PNG.
function decodePainting(base64) {
    if (!base64) return null;
    const png = Buffer.from(String(base64), 'base64');
    if (png.length < 24 || png.length > 200 * 1024 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    if (width < 1 || height < 1 || width > 400 || height > 240) return null;
    return png;
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
