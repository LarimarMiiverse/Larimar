const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./logger');
const { connectDB } = require('./database');

dotenv.config();

const { directoryMiddleware } = require('./middleware/directoryMiddleware');
const { i18nMiddleware } = require('./middleware/i18nMiddleware');
const { authMiddleware } = require('./middleware/authMiddleware');

const routes = require('./routes');

const app = express();

// account-proxy terminates TLS and forwards from 127.0.0.1
app.set('trust proxy', 'loopback');

// Juxt's discovery only sends consoles here while this answers.
app.get('/health', (req, res) => res.send('ok'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, './static')));
app.use('/css', express.static(path.join(__dirname, 'static/css')));
// Community icons and banners uploaded from the staff page
app.use('/media', express.static(path.join(__dirname, '..', 'media')));
app.use(express.json());

app.use(express.urlencoded({
	extended: true,
	limit: '1mb'
}));

app.use(directoryMiddleware);
app.use(i18nMiddleware);
app.use(authMiddleware);

app.use((req, res, next) => {
  res.locals.account = req.account || null;
  const isPjax = req.query._pjax !== undefined && req.get('X-PJAX') !== undefined;
  res.locals.isPjax = isPjax;
  if (isPjax) {
    const cleanUrl = req.originalUrl.replace(/\?.+$/, '');
    res.setHeader('X-PJAX-PATH', cleanUrl);
    res.setHeader('X-PJAX-OK', '1');
  }
  next();
});

app.use(routes);

app.listen(process.env.PORT, async () => {
  connectDB();
  logger.success(`Global Miiverse started on port ${process.env.PORT}`);
});