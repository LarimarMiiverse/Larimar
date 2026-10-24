// Larimar is a general-purpose Miiverse: communities are grouped by topic,
// and only some are about a game. Slugs are letters only, so they match the
// original portal script's ^/communities/categories/[a-z]+$ route. Labels
// are i18n keys under olv.portal (category_<slug>).
const CATEGORIES = ['games', 'creative', 'music', 'chat', 'apps', 'news'];

module.exports = { CATEGORIES };
