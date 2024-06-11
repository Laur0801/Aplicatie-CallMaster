const { logger } = require('../utils/logger');

// Import variabile de mediu
const ASTERISK_HOST = process.env.ASTERISK_HOST || '192.168.1.137';
const ASTERISK_PORT = process.env.ASTERISK_PORT || '5038';
const ASTERISK_USER = process.env.ASTERISK_USER || 'admin';
const ASTERISK_SECRET = process.env.ASTERISK_SECRET || 'secretpass123';

let amiConnected = false;

// Conexiune la Asterisk Manager Interface (AMI)
const ami = require('asterisk-manager')(ASTERISK_PORT, ASTERISK_HOST, ASTERISK_USER, ASTERISK_SECRET, true);
ami.keepConnected();

ami.on('connect', () => {
  logger.info('Conectat la AMI');
  amiConnected = true;
  ami.action({ action: 'CoreShowChannels' }, function (err, res) {
    if (err) {
      logger.error('Eroare la obținerea canalelor:', err);
    } else {
      logger.info('Canale active:', res);
    }
  });
});

ami.on('disconnect', () => {
  logger.error('Deconectat de la AMI');
  amiConnected = false;
});

ami.on('error', (err) => {
  logger.error('Eroare în conexiunea AMI:', err);
  amiConnected = false;
});

function checkIfAsteriskRunning() {
  return Promise.resolve(amiConnected);
}

function actionSipPeers() {
  ami.action({ action: 'SIPpeers' }, function (err, res) {
    if (err) {
      logger.error("Eroare la interogarea SIP peers:", err);
    } else {
      logger.info("Rezultat interogare SIP peers:", res);
    }
  });
}

module.exports = {
  checkIfAsteriskRunning,
  actionSipPeers
};
