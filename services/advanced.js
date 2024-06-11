const { connectMariaDB } = require('../db/db');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Funcție pentru a obține setările din baza de date
async function getSettings() {
  try {
    const result = await connectMariaDB('SELECT * FROM setari');
    if (result.length === 0) {
      return null;
    }
    return result[0];
  } catch (error) {
    console.error('Eroare la încărcarea setărilor:', error);
    throw new Error('Setările nu au fost încărcate');
  }
}

// Funcție pentru a salva setările în baza de date și a le aplica la Asterisk
async function setCoreSettings(bindAddr, bindPort, gatewayMap) {
  try {
    await connectMariaDB('UPDATE setari SET bind_ip = ?, bind_port = ?, default_gateway_map = ?', [bindAddr, bindPort, gatewayMap]);
    await applySettingsToAsterisk(bindAddr, bindPort, gatewayMap);
  } catch (error) {
    console.error('Eroare la setarea setărilor de bază:', error);
    throw error;
  }
}

// Funcție pentru a aplica setările la Asterisk folosind CLI
async function applySettingsToAsterisk(bindAddr, bindPort, gatewayMap) {
  try {
    await execPromise(`/usr/sbin/asterisk -rx "sip set bindaddr ${bindAddr}"`);
    await execPromise(`/usr/sbin/asterisk -rx "sip set bindport ${bindPort}"`);
    // Adaugă alte comenzi necesare pentru a aplica setările
  } catch (error) {
    console.error('Eroare la aplicarea setărilor în Asterisk:', error);
    throw error;
  }
}

module.exports = {
  getSettings,
  setCoreSettings
};
