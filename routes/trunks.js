const express = require('express')
const router = express.Router()

const { getMaxId, createTrunk, deleteTrunk, updateTrunk } = require('../services/trunks')
const { getTrunks } = require('../services/common')
const { defaultError } = require('../utils/defaults')
const { ensureAuthenticated } = require('../services/auth')
const { workingGateways } = require('../services/agi')

router.get('/get_trunks', async (req, res) => {
  try {
    const trunks = await getTrunks()
    res.send(trunks)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.get('/get_online', async (req, res) => {
  try {
    const trunks = workingGateways
    res.send(trunks)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/create_trunk', ensureAuthenticated, async (req, res) => {
  try {
    const { host, codecs, port, secret, user, gatewayExten, gatewayExtenPass, defaultAction } = req.body
    if (!host || !codecs || !gatewayExten || !gatewayExtenPass || !defaultAction) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    console.log(defaultAction)

    const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1)
    const result = await createTrunk(newId, host, port, secret, user, codecs, gatewayExten, gatewayExtenPass, defaultAction)

    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/update_trunk', ensureAuthenticated, async (req, res) => {
  try {
    const { id, host, codecs, port, secret, user, gatewayExten, gatewayExtenPass, defaultAction } = req.body

    if (!id || !host || !codecs || !gatewayExten || !gatewayExtenPass || !defaultAction) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    await updateTrunk(id, host, port, secret, user, codecs, gatewayExten, gatewayExtenPass, defaultAction)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }

  res.send({ error: false })
})

router.post('/delete_trunk', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.body
    const result = await deleteTrunk(id)
    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

module.exports = router
