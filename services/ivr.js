const fs = require('fs').promises

const { checkIfPathExists } = require('../utils/utils.js')
const { connect } = require('../db/db')
const { commitChanges } = require('./common')

async function getSoundsDirectory () {
  const possibleDirs = [
    '/var/lib/asterisk/sounds',
    '/usr/share/asterisk/sounds',
    '/usr/local/share/asterisk/sounds'
  ]

  const promiseOne = []

  for (let i = 0; i < possibleDirs.length; i++) {
    promiseOne.push(checkIfPathExists(possibleDirs[i]))
  }

  const resOne = await Promise.all(promiseOne)
  for (let i = 0; i < resOne.length; i++) {
    if (resOne[i][1] === true) {
      return resOne[i][0]
    }
  }
}

async function getAllSounds () {
  const soundsDir = await getSoundsDirectory()
  const sounds = await fs.readdir(soundsDir)

  const soundsArr = []

  for (let i = 0; i < sounds.length; i++) {
    if (sounds[i].includes('.wav')) {
      if (sounds[i].endsWith('-zyvo.wav')) {
        const oneSound = (sounds[i]).replace('-zyvo.wav', '.wav')
        soundsArr.push(oneSound)
      }
    }
  }

  return soundsArr
}

async function getMaxId () {
  return connect(async db => {
    return await db.get('SELECT MAX(id) as max FROM ivr')
  })
}

async function getIVR (id) {
  return connect(async db => {
    return await db.get('SELECT * FROM ivr WHERE id = ?', [id])
  })
}

async function setDefaultIVR (id) {
  return connect(async db => {
    await db.run('UPDATE ivr SET isDefault = 0')
    await db.run('UPDATE ivr SET isDefault = 1 WHERE id = ?', [id])
    await commitChanges()
  })
}

async function createIVR (id, name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions) {
  return connect(async db => {
    const context = `ivr_${name}`
    const exists = await db.get('SELECT * FROM ivr WHERE name = ?', [name])
    if (exists) {
      return { error: true, message: 'IVR menu already exists' }
    }
    await db.run('INSERT INTO ivr (id, name, context, timeout, greeting_audio, prompt_audio, invalid_audio, timeout_audio, default_extension, menumap, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, context, timeout, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, JSON.stringify(actions)], 0)

    return { error: false, message: 'IVR menu created' }
  })
}

async function deleteIVR (id) {
  return connect(async db => {
    try {
      await db.run('DELETE FROM ivr WHERE id = ?', [id])
      await commitChanges()
      return { error: false, message: 'IVR menu deleted' }
    } catch (error) {
      return { error: true, message: 'Error deleting IVR menu' }
    }
  })
}

async function updateIVR (id, name, greetingAudio, promptAudio, invalidAudio, timeoutAudio, defaultExtension, timeout, actions, isDefault) {
  return connect(async db => {
    try {
      const context = `ivr_${name}`
      await db.run(`UPDATE ivr SET name = '${name}', context = '${context}', timeout = '${timeout}', greeting_audio = '${greetingAudio}', prompt_audio = '${promptAudio}', invalid_audio = '${invalidAudio}', timeout_audio = '${timeoutAudio}', default_extension = '${defaultExtension}', menumap = '${JSON.stringify(actions)}', isDefault = ${isDefault} WHERE ID = ${id};`)
      await commitChanges()

      return { error: false, message: 'IVR menu updated' }
    } catch (error) {
      console.log(error)
      return { error: true, message: 'Error updating IVR menu' }
    }
  })
}

module.exports = {
  getSoundsDirectory,
  getAllSounds,
  getMaxId,
  getIVR,
  setDefaultIVR,
  createIVR,
  deleteIVR,
  updateIVR
}
