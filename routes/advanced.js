const express = require('express')
const router = express.Router()

const { coreExecute } = require('../services/core')
const { getSettings, setCoreSettings } = require('../services/advanced')

router.post('/cli', async (req, res) => {
  const { command } = req.body
  try {
    const result = await coreExecute(command)
    res.send({ result })
  } catch (error) {
    res.send({ result: 'Error executing command' })
  }
})

router.get('/', async (req, res) => {
  res.render('advanced', {
    parent: 'Settings',
    title: 'Advanced'
  })
})

router.get('/sip', async (req, res) => {
  res.render('advanced-sip', {
    parent: 'Settings',
    title: 'SIP Server Settings',
    settings: (await getSettings())
  })
})

router.post('/sip/edit', async (req, res) => {
  const { bindAddr, bindPort } = req.body
  try {
    await setCoreSettings(bindAddr, bindPort)
  } catch (error) {
    res.send({ error: true })
    console.log(error)
    return
  }
  res.send({ error: false })
})

module.exports = router
