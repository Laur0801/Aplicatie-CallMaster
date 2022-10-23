const express = require('express')
const router = express.Router()

const { getMaxId, createTrunk, deleteTrunk, updateTrunk } = require('../services/trunks')
const { getTrunks } = require('../services/common')
const { defaultError } = require('../utils/defaults')

router.get('/get_trunks', async (req, res) => {
  try {
    const trunks = await getTrunks()
    res.send(trunks)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/create_trunk', async (req, res) => {
  try {
    const { host, codecs, port, secret } = req.body

    if (!host || !codecs) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1)
    const result = await createTrunk(newId, host, port, secret, codecs)

    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/update_trunk', async (req, res) => {
  try {
    const { id, host, codecs, port, secret } = req.body

    if (!id || !host) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    await updateTrunk(id, host, port, secret, codecs)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }

  res.send({ error: false })
})

router.post('/delete_trunk', async (req, res) => {
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
