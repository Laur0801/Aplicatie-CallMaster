const express = require('express');
const router = express.Router();

const { createExtension, deleteExtension, updateExtension, getMaxId, getOneExtension, loadExts } = require('../services/extensions');
const { ensureAuthenticated } = require('../services/auth');

router.get('/get_extensions', ensureAuthenticated, async (req, res) => {
  try {
    const extensions = await loadExts();
    res.send(extensions);
  } catch (error) {
    console.error(error);
    res.send({ error: true, message: 'Eroare la încărcarea extensiilor' });
  }
});

router.post('/create_extension', ensureAuthenticated, async (req, res) => {
  try {
    const { nume, extensie, parola } = req.body;

    if (!nume || !extensie || !parola) {
      res.send({ error: true, message: 'Lipsesc parametrii' });
      return;
    }

    const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1);
    const result = await createExtension(nume, extensie, parola);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({ error: true, message: 'Eroare la crearea extensiei' });
  }
});

router.post('/delete_extension', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.body;
    const result = await deleteExtension(id);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({ error: true, message: 'Eroare la ștergerea extensiei' });
  }
});

router.post('/update_extension', ensureAuthenticated, async (req, res) => {
  try {
    const { id, nume, extensie, parola } = req.body;
    await updateExtension(id, nume, extensie, parola);
    res.send({ error: false });
  } catch (error) {
    console.error(error);
    res.send({ error: true, message: 'Eroare la actualizarea extensiei' });
  }
});

module.exports = router;
