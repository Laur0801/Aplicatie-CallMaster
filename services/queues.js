const { connectMariaDB } = require('../db/db');
const { commitChanges } = require('./common');

async function getMaxId() {
  const result = await connectMariaDB('SELECT MAX(id) as max FROM gestionare_apeluri');
  return result[0].max || 0; // Returnează 0 dacă nu există cozi
}

async function createQueue(nume, strategie, timeout, autopauza) {
  const existingQueue = await connectMariaDB('SELECT * FROM gestionare_apeluri WHERE nume = ?', [nume]);

  if (!existingQueue.length) {
    const id = (await getMaxId()) + 1; // Obține un nou ID
    await connectMariaDB('INSERT INTO gestionare_apeluri (id, nume, strategie, timeout, autopauza) VALUES (?, ?, ?, ?, ?)', [id, nume, strategie, timeout, autopauza]);
    await commitChanges();
    return { error: false, created: true };
  } else {
    return { error: true, message: 'Coadă deja există' };
  }
}

async function deleteQueue(id) {
  await connectMariaDB('DELETE FROM gestionare_apeluri WHERE id = ?', [id]);
  await reorder();
  await commitChanges();
  return { deleted: true };
}

async function updateQueue(id, nume, strategie, timeout, autopauza) {
  await connectMariaDB('UPDATE gestionare_apeluri SET nume = ?, strategie = ?, timeout = ?, autopauza = ? WHERE id = ?', [nume, strategie, timeout, autopauza, id]);
  await commitChanges();
}

async function reorder() {
  const queues = await getQueues();
  await connectMariaDB('DELETE FROM gestionare_apeluri');
  for (let i = 0; i < queues.length; i++) {
    await connectMariaDB('INSERT INTO gestionare_apeluri (id, nume, strategie, timeout, autopauza) VALUES (?, ?, ?, ?, ?)', [i + 1, queues[i].nume, queues[i].strategie, queues[i].timeout, queues[i].autopauza]);
  }
  await commitChanges();
}

async function fetchQueueDetails(id) {
  const result = await connectMariaDB('SELECT * FROM gestionare_apeluri WHERE id = ?', [id]);
  return result.length ? result[0] : null;
}

async function getQueues() {
  return await connectMariaDB('SELECT * FROM gestionare_apeluri');
}

module.exports = {
  getMaxId,
  fetchQueueDetails,
  createQueue,
  deleteQueue,
  updateQueue,
  getQueues
};
