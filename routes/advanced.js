const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../services/auth');
const { getSettings, setCoreSettings } = require('../services/advanced');
const { coreExecute } = require('../services/core');

router.post('/cli', ensureAuthenticated, async (req, res) => {
  const { command } = req.body;
  try {
    const result = await coreExecute(command);
    res.send({ result });
  } catch (error) {
    res.send({ result: 'Error executing command' });
  }
});

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('advanced', {
    parent: 'Setări',
    title: 'Setări Avansate'
  });
});

router.get('/sip', ensureAuthenticated, async (req, res) => {
  try {
    const settings = await getSettings();
    res.render('advanced-sip', {
      parent: 'Setări',
      title: 'Setări server SIP',
      settings: settings || { bind_ip: '', bind_port: '', default_gateway_map: '' }
    });
  } catch (error) {
    console.error('Eroare la încărcarea setărilor:', error);
    res.status(500).send('Eroare la încărcarea setărilor');
  }
});

router.post('/sip/edit', ensureAuthenticated, async (req, res) => {
  const { bindAddr, bindPort, gatewayMap } = req.body;
  try {
    await setCoreSettings(bindAddr, bindPort, gatewayMap);
    res.send({ error: false });
  } catch (error) {
    res.send({ error: true });
    console.log(error);
  }
});

module.exports = router;
