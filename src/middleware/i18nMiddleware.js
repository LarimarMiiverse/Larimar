const path = require('path');
const fs = require('fs');

const translations = {
    en: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'i18n', 'en.json'), 'utf8')),
    fr: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'i18n', 'fr.json'), 'utf8'))
};

async function i18nMiddleware(req, res, next) {
    const header = req.headers['accept-language'] || 'en';

    let lang = header.slice(0, 2).toLowerCase();

    if (!translations[lang]) {
        lang = 'en';
    }

    res.locals.lang = translations[lang];
    res.locals.local = lang;

    next();
}

module.exports = { i18nMiddleware };