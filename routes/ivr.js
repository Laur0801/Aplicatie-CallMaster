const express = require('express')
const router = express.Router()
const formidable = require('formidable')

const fs = require('fs').promises
const path = require('path')
const os = require('os')

const { getSoundsDirectory, getAllSounds } = require('../services/ivr')
const { convertMP3toWAV } = require('../utils/utils')
const { defaultError } = require('../utils/defaults')

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

router.get('/plan', async (req, res) => {
  res.render('ivr-plan', {
    parent: 'IVR',
    title: 'Plan'
  })
})

module.exports = router
