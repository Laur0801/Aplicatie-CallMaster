const express = require('express')
const router = express.Router()

const {
  getMaxId,
  createExtension,
  deleteExtension,
  updateExtension
} = require('../services/extensions')

const {
  getExtensions,
  commitChanges
} = require('../services/common')

const {
  defaultError
} = require('../utils/defaults')

router.get('/get_extensions', async (req, res) => {
  try {
    const extensions = await getExtensions()
    res.send(extensions)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/create_extension', async (req, res) => {
  try {
    const { name, extension, secret } = req.body

    if (!name || !extension || !secret) {
      res.send({ error: true, message: 'Missing parameters' })
      return
    }

    const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1)
    const result = await createExtension(newId, name, extension, secret)

    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/delete_extension', async (req, res) => {
  try {
    const { id } = req.body
    const result = await deleteExtension(id)
    res.send(result)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
  }
})

router.post('/update_extension', async (req, res) => {
  try {
    const { id, name, extension, secret } = req.body
    await updateExtension(id, name, extension, secret)
  } catch (error) {
    console.log(error)
    res.send(defaultError)
    return
  }

  res.send({ error: false })
})

router.post('/commit_changes', async (req, res) => {
  try {
    await commitChanges()
  } catch (error) {
    console.log(error)
    res.send({ error: true })
    return
  }

  res.send({ error: false, message: 'All updates made to asterisk configuration' })
})

module.exports = router
