const express = require('express');
const router = express.Router();
const mariadb = require('mariadb');

const { fetchServerUptime, checkMariaDB, checkAsterisk } = require('../services/core');
const { getOneExtension, loadExts } = require('../services/extensions');
const { fetchQueueDetails } = require('../services/queues');
const { ensureAuthenticated } = require('../services/auth');

const pool = mariadb.createPool({
  host: '192.168.1.137', 
  user: 'admin_departamente', 
  password: 'secretpass123',
  database: 'asteriskdb',
  connectionLimit: 5
});

// Ruta pentru panoul de control
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const extensions = await loadExts();  // Încarcă toate extensiile
    const extensionsCount = extensions.length; // Obține numărul de extensii
    const uptimeStats = await fetchServerUptime();
    const mariadbStatus = await checkMariaDB();
    const asteriskStatus = await checkAsterisk();
    
    res.render('index', {
      title: 'Panou de control',
      parent: 'General',
      extensionsCount,
      uptimeStats,
      mariadbStatus,
      asteriskStatus,
      extensions  // Trimite extensiile către pagina principală
    });
  } catch (error) {
    console.error('Eroare la încărcarea panoului de control:', error);
    res.status(500).send('Eroare la încărcarea panoului de control.');
  }
});

// Ruta pentru istoricul apelurilor
router.get('/istoric-apeluri', ensureAuthenticated, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM inregistrari_apeluri");
    res.render('call-history', {
      title: 'Istoric Apeluri',
      parent: 'General',
      inregistrari_apeluri: rows
    });
  } catch (err) {
    console.error('Eroare la încărcarea istoricului de apeluri:', err);
    res.status(500).send('Eroare la încărcarea istoricului de apeluri.');
  } finally {
    if (conn) conn.release();
  }
});

// Restul codului pentru alte rute
router.get('/login', async (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});

router.get('/extensions/create', ensureAuthenticated, async (req, res) => {
  res.render('create-extension', {
    title: 'Creare Extensie',
    parent: 'Extensii'
  });
});

router.get('/extensions/edit', ensureAuthenticated, async (req, res) => {
  res.render('edit-extensions', {
    title: 'Editează Extensiile',
    parent: 'Extensii'
  });
});

router.get('/extensions/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const editing = await getOneExtension(req.params.id);
    if (!editing) {
      res.redirect('/?error=Extensie+nu+este+găsită');
      return;
    }
    res.render('edit-extension', {
      title: 'Editează Extensie',
      parent: 'Extensii',
      extensionDetails: editing
    });
  } catch (error) {
    console.error('Eroare la încărcarea extensiei:', error);
    res.status(500).send('Eroare la încărcarea extensiei.');
  }
});

router.get('/queues/create', ensureAuthenticated, async (req, res) => {
  res.render('create-queue', {
    title: 'Adaugă Apel',
    parent: 'Gestionare apeluri'
  });
});

router.get('/queues/edit', ensureAuthenticated, async (req, res) => {
  res.render('edit-queues', {
    title: 'Modifică Apel',
    parent: 'Gestionare apeluri'
  });
});

router.get('/queues/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const queue = await fetchQueueDetails(req.params.id);
    res.render('edit-queue', {
      title: 'Modifică Apel',
      parent: 'Gestionare apeluri',
      queueDetails: queue
    });
  } catch (error) {
    console.error('Eroare la încărcarea cozii:', error);
    res.status(500).send('Eroare la încărcarea cozii.');
  }
});

router.get('/edit-manually', ensureAuthenticated, async (req, res) => {
  res.render('manual-edit', {
    title: 'Editare Manuală',
    parent: 'Manage SIP Server'
  });
});

module.exports = router;
