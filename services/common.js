const { connectMariaDB } = require('../db/db');

async function loadExts(count = false) {
  try {
    if (count) {
      const result = await connectMariaDB('SELECT COUNT(*) as count FROM extensii');
      return result[0];
    } else {
      return await connectMariaDB('SELECT * FROM extensii');
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
    const result = await connectMariaDB('SELECT * FROM setari');
    if (result.length === 0) {
      throw new Error('Setările nu au fost găsite');
    }
    return result[0];
  } catch (error) {
    console.error('Eroare la încărcarea setărilor:', error);
    throw new Error('Setările nu au fost încărcate');
  }
}

module.exports = {
  getSettings,
  loadExts,
  getQueues,
};
