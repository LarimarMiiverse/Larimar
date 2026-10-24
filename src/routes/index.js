const express = require('express');
const sub = require('express-subdomain');

const console = express.Router();

const activity = require('./activity');
const show = require('./show');
const communities = require('./communities');
const messages = require('./messages');
const news = require('./news');
const users = require('./users');
const settings = require('./settings');

console.use('/', activity);
console.use('/settings', settings);
console.use('/titles/show', show);
console.use('/titles', communities);
console.use('/communities', communities);
console.use('/friend_messages', messages);
console.use('/news', news);
console.use('/users', users);

const router = express.Router();

router.use(sub('miiverse', console)); // live
router.use(sub('miiverse-t1', console)); // test
router.use(sub('miiverse-d1', console)); // dev

router.use(sub('portal-l1', console)); // live
router.use(sub('portal-t1', console)); // test
router.use(sub('portal-d1', console)); // dev

router.use(sub('n3ds-l1', console)); // live
router.use(sub('n3ds-t1', console)); // test
router.use(sub('n3ds-d1', console)); // dev

module.exports = console;