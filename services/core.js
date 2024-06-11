const { Client } = require('ssh2');
const { connectMariaDB } = require('../db/db');
const { configPaths, userAsteriskConfig } = require('../utils/defaults');
const { createFileIfNotExists, fromBase64 } = require('../utils/utils');
const { logger } = require('../utils/logger');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const os = require('os');
const { checkIfAsteriskRunning } = require('./ami');
const express = require('express');
const router = express.Router();

const sshConfig = {
  host: '192.168.1.137',
  port: 22,
  username: 'laur_',
  password: '123456'
};

async function getMemoryUsageSSH(processName) {
  const command = `ps aux | grep ${processName} | grep -v grep | awk '{print $6}'`;
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          reject(err);
        }
        let data = '';
        stream.on('data', (chunk) => {
          data += chunk;
        }).on('close', (code, signal) => {
          conn.end();
          resolve(parseFloat(data.trim()));
        });
      });
    }).connect(sshConfig);
  });
}

router.get('/memory_usage', async (req, res) => {
  try {
    const asteriskMemory = await getMemoryUsageSSH('asterisk');
    const mariadbMemory = await getMemoryUsageSSH('mysqld');
    res.json({ asterisk: asteriskMemory, mariadb: mariadbMemory });
  } catch (error) {
    logger.error('Eroare la obținerea utilizării memoriei:', error);
    res.status(500).json({ error: 'Eroare la obținerea utilizării memoriei' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await connectMariaDB('SELECT * FROM statistici ORDER BY timestamp DESC LIMIT 50');
    const adjustedResult = result.map(stat => {
      stat.timestamp = new Date(stat.timestamp).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' });
      return stat;
    });
    res.json(adjustedResult);
  } catch (error) {
    logger.error('Eroare la încărcarea statisticilor:', error);
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor' });
  }
});

async function core(command) {
  try {
    const { stdout, stderr } = await execPromise(`/usr/sbin/asterisk -rx "${command}"`);
    if (stderr) {
      console.error(`Eroare la executarea comenzii Asterisk: ${stderr}`);
    }
    return stdout;
  } catch (error) {
    console.error(`Eroare la executarea comenzii Asterisk: ${error}`);
  }
}

async function fetchServerUptime() {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      const uptimeSeconds = os.uptime();
      const uptimeDays = Math.floor(uptimeSeconds / (60 * 60 * 24));
      const uptimeHours = Math.floor((uptimeSeconds % (60 * 60 * 24)) / (60 * 60));
      const uptimeMinutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);

      return `up ${uptimeDays} days, ${uptimeHours} hours, ${uptimeMinutes} minutes`;
    } else {
      const { stdout } = await execPromise('uptime -p');
      return stdout.trim();
    }
  } catch (error) {
    console.error('Eroare la obținerea timpului de funcționare:', error);
    return 'N/A';
  }
}

async function readRemoteFile(filePath) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) reject(err);

        sftp.readFile(filePath, 'utf8', (err, data) => {
          if (err) reject(err);
          resolve(data);
          conn.end();
        });
      });
    }).connect(sshConfig);
  });
}

async function getCoreConfig() {
  try {
    console.log('userAsteriskConfig:', userAsteriskConfig);
    const sipConf = await readRemoteFile(userAsteriskConfig.sipConf);
    const extensionsConf = await readRemoteFile(userAsteriskConfig.extensionsConf);
    const queuesConf = await readRemoteFile(userAsteriskConfig.queuesConf);

    console.log('SIP Configuration:', sipConf);
    console.log('Extensions Configuration:', extensionsConf);
    console.log('Queues Configuration:', queuesConf);

    return {
      sipConf: Buffer.from(sipConf).toString('base64'),
      extensionsConf: Buffer.from(extensionsConf).toString('base64'),
      queuesConf: Buffer.from(queuesConf).toString('base64')
    };
  } catch (error) {
    console.error('Eroare la obținerea configurației principale:', error);
    throw error;
  }
}

async function loadExts(count = false) {
  try {
    if (count) {
      const result = await connectMariaDB('SELECT COUNT(*) as count FROM extensions');
      return result[0];
    } else {
      return await connectMariaDB('SELECT * FROM extensions');
    }
  } catch (error) {
    console.error('Eroare la încărcarea extensiilor:', error);
    return [];
  }
}

async function getQueues(count = false) {
  try {
    if (count) {
      const result = await connectMariaDB('SELECT COUNT(*) as count FROM gestionare_apeluri');
      return result[0];
    } else {
      return await connectMariaDB('SELECT * FROM gestionare_apeluri');
    }
  } catch (error) {
    console.error('Eroare la încărcarea cozii:', error);
    return [];
  }
}

async function getSettings() {
  try {
    const result = await connectMariaDB('SELECT * FROM settings');
    return result[0];
  } catch (error) {
    console.error('Eroare la încărcarea setărilor:', error);
    return null;
  }
}

async function checkMariaDB() {
  try {
    const result = await connectMariaDB('SELECT 1');
    return result ? true : false;
  } catch (error) {
    console.error('Eroare la verificarea MariaDB:', error);
    return false;
  }
}

async function checkAsterisk() {
  try {
    const isRunning = await checkIfAsteriskRunning();
    return isRunning;
  } catch (error) {
    console.error('Eroare la verificarea Asterisk:', error);
    return false;
  }
}

async function commitFsCheck() {
  const existPromiseArr = [];
  for (const value of Object.values(userAsteriskConfig)) {
    existPromiseArr.push(createFileIfNotExists(value));
  }

  const existArr = await Promise.all(existPromiseArr);
  for (const one of existArr) {
    if (!one) {
      return false;
    }
  }

  let managerConfStr = '';
  managerConfStr += '[general]\n';
  managerConfStr += 'enabled=yes\n';
  managerConfStr += 'port=5038\n';
  managerConfStr += 'bindaddr=0.0.0.0\n\n';

  managerConfStr += '[admin]\n';
  managerConfStr += 'secret=CallMaster\n';
  managerConfStr += 'permit=0.0.0.0/0.0.0.0\n';
  managerConfStr += 'read = all,system,call,user,dtmf\n';
  managerConfStr += 'write = all,system,call,user,dtmf\n';

  let moduleConfStr = '';
  moduleConfStr += '[modules]\n';
  moduleConfStr += 'autoload=yes\n\n';
  moduleConfStr += 'require => chan_sip.so\n';

  await Promise.all([
    fs.writeFile(configPaths.managerConf, managerConfStr),
    fs.writeFile(configPaths.modulesConf, moduleConfStr)
  ]);

  return true;
}

async function commitChanges(startup = false) {
  if (startup === true) {
    const fsCheck = await commitFsCheck();
    if (!fsCheck) {
      console.log('Eroare: Verificarea sistemului de fișiere a eșuat');
      process.exit(1);
    }

    logger.info('Fișierele de configurare pentru Asterisk au fost scrise');
  }

  await Promise.all([
    writeSipConf(),
    writeExtensionsConf(),
    writeQueuesconf()
  ]);

  core('reload');
}

module.exports = {
  core,
  fetchServerUptime,
  getCoreConfig,
  loadExts,
  getQueues,
  getSettings,
  commitChanges,
  checkMariaDB,
  checkAsterisk,
  router
};
