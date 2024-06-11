const { connectMariaDB } = require('../db/db');

async function getMaxId() {
  const result = await connectMariaDB('SELECT MAX(id) as max FROM extensii');
  return result[0].max || 0;  // Returnează 0 dacă nu există extensii
}

async function createExtension(nume, extensie, parola) {
  const [
    existOne,
    existTwo
  ] = await Promise.all([
    connectMariaDB('SELECT * FROM extensii WHERE extensie = ?', [extensie]),
    connectMariaDB('SELECT * FROM extensii WHERE nume = ?', [nume])
  ]);

  if (!existOne.length && !existTwo.length) {
    const id = (await getMaxId()) + 1;  // Obține un nou ID
    await connectMariaDB('INSERT INTO extensii (id, nume, extensie, parola) VALUES (?, ?, ?, ?)', [id, nume, extensie, parola]);
    return { error: false, created: true };
  } else {
    return { error: true, message: 'Extensia sau numele deja există' };
  }
}

async function deleteExtension(id) {
  await connectMariaDB('DELETE FROM extensii WHERE id = ?', [id]);
  await reorder();

  return { deleted: true };
}

async function updateExtension(id, nume, extensie, parola) {
  await connectMariaDB('UPDATE extensii SET nume = ?, extensie = ?, parola = ? WHERE id = ?', [nume, extensie, parola, id]);
}

async function reorder() {
  const extensions = await loadExts();
  await connectMariaDB('DELETE FROM extensii');
  for (let i = 0; i < extensions.length; i++) {
    await connectMariaDB('INSERT INTO extensii (id, nume, extensie, parola) VALUES (?, ?, ?, ?)', [i + 1, extensions[i].nume, extensions[i].extensie, extensions[i].parola]);
  }
}

async function getOneExtension(id) {
  const result = await connectMariaDB('SELECT * FROM extensii WHERE id = ?', [id]);
  return result.length ? result[0] : null;
}

async function loadExts() {
  return await connectMariaDB('SELECT * FROM extensii');
}

module.exports = {
  getMaxId,
  getOneExtension,
  createExtension,
  deleteExtension,
  updateExtension,
  loadExts
};
