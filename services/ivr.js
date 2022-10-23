const fs = require('fs').promises

const { checkIfPathExists } = require('../utils/utils.js')

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

module.exports = {
  getSoundsDirectory,
  getAllSounds
}
