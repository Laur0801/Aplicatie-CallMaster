const express = require('express');
const router = express.Router();

const {
  createQueue,
  deleteQueue,
  updateQueue,
  fetchQueueDetails,
  getQueues
} = require('../services/queues');

const { ensureAuthenticated } = require('../services/auth');

// Get all queues
router.get('/get_queues', ensureAuthenticated, async (req, res) => {
  try {
    const queues = await getQueues();
    res.json({ error: false, queues });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Eroare la încărcarea cozilor' });
  }
});

// Create a new queue
router.post('/create_queue', ensureAuthenticated, async (req, res) => {
  const { nume, strategie, timeout, autopauza } = req.body;
  if (!nume || !strategie || !timeout || autopauza == null) {
    return res.status(400).json({ error: true, message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    const result = await createQueue(nume, strategie, timeout, autopauza === 'true');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Eroare la crearea cozii' });
  }
});

// Delete a queue
router.post('/delete_queue', ensureAuthenticated, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: true, message: 'ID-ul cozii este necesar' });
  }

  try {
    const result = await deleteQueue(id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Eroare la ștergerea cozii' });
  }
});

// Update a queue
router.post('/update_queue', ensureAuthenticated, async (req, res) => {
  const { id, nume, strategie, timeout, autopauza } = req.body;
  if (!id || !nume || !strategie || !timeout || autopauza == null) {
    return res.status(400).json({ error: true, message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    await updateQueue(id, nume, strategie, timeout, autopauza === 'true');
    res.json({ error: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Eroare la actualizarea cozii' });
  }
});

module.exports = router;
