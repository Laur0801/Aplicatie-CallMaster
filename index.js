require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3001;
const { initDb } = require('./db/db');
const { logger } = require('./utils/logger');
const { asciiArt } = require('./utils/defaults');
const { startCron } = require('./services/cron');
const { checkIfAsteriskRunning } = require('./services/ami');
const { fetchServerUptime } = require('./services/core');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dummy_secret',
    resave: true,
    saveUninitialized: true
}));

const passport = require('passport');
require('./services/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/extensions', require('./routes/extensions'));
app.use('/api/queues', require('./routes/queues'));
app.use('/api/core', require('./routes/core'));
app.use('/auth', require('./routes/auth'));
app.use('/advanced', require('./routes/advanced'));
app.use('/', require('./routes/index'));

app.listen(PORT, async () => {
    await initDb();
    console.log(await asciiArt());

    const asteriskRunning = await checkIfAsteriskRunning();
    if (!asteriskRunning) {
        logger.error('Asterisk nu rulează. Te rog pornește-l și încearcă din nou.');
    } else {
        logger.info('Conexiunea cu Asterisk prin AMI este activă.');
    }

    const uptime = await fetchServerUptime();
    console.log(`Uptime: ${uptime}`);

    startCron();
    logger.info(`Serverul CallMaster ascultă pe portul ${PORT}`);
});

module.exports = app;
