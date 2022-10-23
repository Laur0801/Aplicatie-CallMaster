const express = require('express')
const router = express.Router()
const fs = require('fs').promises

const {
  fromBase64
} = require('../utils/utils')

const {
  core,
  getCoreConfig
} = require('../services/core')

const {
  asteriskConfig
} = require('../utils/defaults')

router.get('/action/:command', async (req, res) => {
  const action = req.params.command
  const result = await core(action)
  res.send({
    status: result
  })
})

router.get('/get_core_config', async (req, res) => {
  try {
    const coreConfig = await getCoreConfig()
    res.send(coreConfig)
  } catch (error) {
    res.send({
      error: true
    })
  }
})

router.post('/update_sip_config', async (req, res) => {
  try {
    let { sipConf } = req.body
    sipConf = await fromBase64(sipConf)

    await Promise.all([
      fs.writeFile(asteriskConfig.sipConf, sipConf),
      core('reload')
    ])
  } catch (error) {
    console.log(error)
    res.send({
      error: true
    })
    return
  }

  res.send({
    error: false
  })
})

router.post('/update_extensions_config', async (req, res) => {
  try {
    let { extensionsConf } = req.body
    extensionsConf = await fromBase64(extensionsConf)

    await Promise.all([
      fs.writeFile(asteriskConfig.extensionsConf, extensionsConf),
      core('reload')
    ])
  } catch (error) {
    console.log(error)
    res.send({
      error: true
    })
    return
  }

  res.send({
    error: false
  })
})

module.exports = router
