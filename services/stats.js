const { Client } = require('ssh2');
const { promisify } = require('util');
const { connectMariaDB } = require('../db/db');
const pidusage = require('pidusage');

const sshConfig = {
  host: '192.168.1.137', // IP-ul Raspberry Pi
  port: 22,
  username: 'laur_', // Username-ul de pe Raspberry Pi
  password: '123456' // Parola de pe Raspberry Pi
};

const puPromise = promisify(pidusage);

// Funcție pentru a obține utilizarea memoriei pentru un proces specific prin SSH
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

async function getAsteriskMemory() {
  try {
    return await getMemoryUsageSSH('asterisk');
  } catch (error) {
    console.error('Eroare la obținerea utilizării memoriei pentru Asterisk:', error);
    return 0;
  }
}

async function getMariaDbMemory() {
  try {
    return await getMemoryUsageSSH('mariadb');
  } catch (error) {
    console.error('Eroare la obținerea utilizării memoriei pentru MariaDB:', error);
    return 0;
  }
}

async function getCallMasterMemory() {
  try {
    const stats = await puPromise(process.pid);
    return stats.memory / 1024; // convert to KB
  } catch (error) {
    console.error('Eroare la obținerea utilizării memoriei pentru CallMaster:', error);
    return 0;
  }
}

// Funcție pentru a colecta și stoca statistici
async function storeStats() {
  try {
    const timestamp = new Date();
    const asteriskMemory = await getAsteriskMemory();
    const callMasterMemory = await getCallMasterMemory();
    const mariaDbMemory = await getMariaDbMemory();

    console.log(`Asterisk Memory: ${asteriskMemory}`);
    console.log(`CallMaster Memory: ${callMasterMemory}`);
    console.log(`MariaDB Memory: ${mariaDbMemory}`);

    await connectMariaDB('INSERT INTO statistici (timestamp, asterisk_memory, callmaster_memory, mariadb_memory) VALUES (?, ?, ?, ?)', [timestamp, asteriskMemory, callMasterMemory, mariaDbMemory]);
  } catch (error) {
    console.error('Eroare la stocarea statisticilor:', error);
  }
}

// Funcție pentru a încărca statisticile
async function loadStats() {
  try {
    const result = await connectMariaDB('SELECT * FROM statistici ORDER BY timestamp DESC LIMIT 50');
    return result;
  } catch (error) {
    console.error('Eroare la încărcarea statisticilor:', error);
    return [];
  }
}

module.exports = {
  storeStats,
  loadStats
};
