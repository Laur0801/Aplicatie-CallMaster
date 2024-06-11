const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { fromBase64 } = require('../utils/utils');
const { core, getCoreConfig } = require('../services/core');
const { defaultUserConfig } = require('../utils/defaults');
const { ensureAuthenticated } = require('../services/auth');
const { loadStats } = require('../services/stats');

router.get('/action/:command', ensureAuthenticated, async (req, res) => {
  const action = req.params.command;
  const result = await core(action);
  res.send({
    status: result
  });
});

router.get('/get_core_config', ensureAuthenticated, async (req, res) => {
  try {
    const coreConfig = await getCoreConfig();
    res.send(coreConfig);
  } catch (error) {
    res.send({
      error: true
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const statsData = await loadStats();
    res.json(statsData);
  } catch (error) {
    console.error("Eroare la obținerea datelor statistice: ", error);
    res.status(500).send({
      error: "A apărut o eroare la preluarea datelor statistice."
    });
  }
});

router.post('/update_sip_config', ensureAuthenticated, async (req, res) => {
  try {
    let { sipConf } = req.body;
    sipConf = await fromBase64(sipConf);

    await Promise.all([
      fs.writeFile(defaultUserConfig.sipConf, sipConf),
      core('reload')
    ]);
  } catch (error) {
    console.log(error);
    res.send({
      error: true
    });
    return;
  }

  res.send({
    error: false
  });
});

router.post('/update_extensions_config', ensureAuthenticated, async (req, res) => {
  try {
    let { extensionsConf } = req.body;
    extensionsConf = await fromBase64(extensionsConf);

    await Promise.all([
      fs.writeFile(defaultUserConfig.extensionsConf, extensionsConf),
      core('reload')
    ]);
  } catch (error) {
    console.log(error);
    res.send({
      error: true
    });
    return;
  }

  res.send({
    error: false
  });
});

router.post('/update_queues_config', async (req, res) => {
  try {
    let { queuesConf } = req.body;
    queuesConf = await fromBase64(queuesConf);

    await Promise.all([
      fs.writeFile(defaultUserConfig.queuesConf, queuesConf),
      core('reload')
    ]);
  } catch (error) {
    console.log(error);
    res.send({
      error: true
    });
    return;
  }

  res.send({
    error: false
  });
});

module.exports = router;
