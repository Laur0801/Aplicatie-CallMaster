const { exec } = require('child_process');
const figlet = require('figlet');
const pjson = require('../package.json'); // Asigură-te că calea este corectă
const mariadb = require('mariadb');

// Configurarea conexiunii la MariaDB
const dbPool = mariadb.createPool({
  host: '192.168.1.137',       // IP-ul Raspberry Pi
  user: 'admin_departamente',  // Utilizatorul
  password: 'secretpass123',   // Parola
  database: 'asteriskdb',      // Baza de date
  connectionLimit: 5
});

const configPaths = {
  sipConf: '/etc/asterisk/sip.conf',
  extensionsConf: '/etc/asterisk/extensions.conf',
  queuesConf: '/etc/asterisk/queues.conf',
  managerConf: '/etc/asterisk/manager.conf',
  modulesConf: '/etc/asterisk/modules.conf'
};

const userAsteriskConfig = {
  sipConf: '/etc/asterisk/sip.conf',
  extensionsConf: '/etc/asterisk/extensions.conf',
  queuesConf: '/etc/asterisk/queues.conf'
};

async function asciiArt() {
  return new Promise((resolve, reject) => {
    figlet('CallMaster', function (err, data) {
      if (err) {
        console.log('Custom App v${pjson.version}');
        console.error(err);
        reject(err);
      } else {
        console.log(`${data}\n\tv${pjson.version}`);
        resolve(data);
      }
    });
  });
}

async function isAsteriskActive() {
  return new Promise((resolve, reject) => {
    exec('ps -A | grep asterisk', (err, stdout, stderr) => {
      if (err) {
        console.error('Error checking Asterisk status', err);
        resolve(false);
      }
      resolve(stdout ? true : false);
    });
  });
}

module.exports = {
  asciiArt,
  configPaths,
  userAsteriskConfig,
  isAsteriskActive,
  dbPool
};
