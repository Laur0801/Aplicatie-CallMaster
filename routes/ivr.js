const express = require('express')
const router = express.Router()
const formidable = require('formidable')

const fs = require('fs').promises
const path = require('path')
const os = require('os')

const { getSoundsDirectory, getAllSounds } = require('../services/ivr')
const { convertMP3toWAV } = require('../utils/utils')
const { defaultError } = require('../utils/defaults')
const { getIVRs } = require('../services/common')

const {
  setDefaultIVR,
  getIVR,
  createIVR,
  deleteIVR,
  updateIVR,
  getMaxId
} = require('../services/ivr')

router.post('/sounds/upload', async function (req, res) {
  const form = formidable({ multiples: false })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.json({ error: true })
      return
    }
    const fileName = files.filepond.originalFilename
    const oldFilePath = files.filepond.filepath
    const newFilePathMP3 = path.join(os.tmpdir(), fileName)
    fs.rename(oldFilePath, newFilePathMP3)

    const fileNameWOExtension = fileName.split('.').slice(0, -1).join('.')
    const newFileNameWAV = (fileNameWOExtension + '-zyvo' + '.wav')
    const astFilePath = path.join((await getSoundsDirectory()), newFileNameWAV)

    const ret = await convertMP3toWAV(newFilePathMP3, astFilePath)
    if (ret === true) {
      res.json({ filePath: astFilePath })
    } else {
      res.json({ error: true })
    }
  })
})

router.post('/sounds/delete', async function (req, res) {
  const { name } = req.body
  const astFilePath = path.join((await getSoundsDirectory()), name)
  try {
    await fs.unlink(astFilePath)
  } catch (error) {
    console.log(error)
    res.json({ error: true })
    return
  }

  res.json({ error: false })
})

router.get('/sounds', async (req, res) => {
  res.render('ivr-sounds', {
    parent: 'IVR',
    title: 'Sounds'
  })
})

router.get('/get_sounds', async (req, res) => {
  try {
    const sounds = await getAllSounds()
    res.json(sounds)
  } catch (error) {
    res.send(defaultError)
  }
})

router.get('/get_all', async (req, res) => {
  try {
    const ivrs = await getIVRs()
    res.json(ivrs)
  } catch (error) {
    res.send(defaultError)
  }
})

router.get('/create', async (req, res) => {
  res.render('create-ivr', {
    parent: 'IVR',
    title: 'Create Plan'
  })
})

router.get('/edit', async (req, res) => {
  res.render('edit-ivr-plans', {
    parent: 'IVR',
    title: 'Edit'
  })
})

router.get('/edit/:id', async (req, res) => {
  const { id } = req.params
  const ivrDetails = await getIVR(id)

  res.render('edit-ivr', {
    parent: 'IVR',
    title: 'Edit',
    ivrDetails
  })
})

router.post('/edit', async (req, res) => {
  const { id, name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions } = req.body
  const resp = await updateIVR(id, name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions, 0)
  res.json(resp)
})

router.post('/set_default', async (req, res) => {
  const { id } = req.body
  try {
    await setDefaultIVR(id)
    res.json({ error: false })
  } catch (error) {
    console.log(error)
    res.json({ error: true })
  }
})

router.post('/create', async (req, res) => {
  const { name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions } = req.body
  const newId = (!((await getMaxId()).max)) ? 1 : (parseInt(((await getMaxId()).max)) + 1)
  const created = await createIVR(newId, name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions)

  res.json(created)
})

router.post('/delete', async (req, res) => {
  const { id } = req.body
  const deleted = await deleteIVR(id)

  res.json(deleted)
})

module.exports = router
