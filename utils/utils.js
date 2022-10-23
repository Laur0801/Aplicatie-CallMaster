const { promisify } = require('util')

const fs = require('fs').promises
const exec = promisify(require('child_process').exec)

async function toBase64 (text) {
  let retVal = ''
  const buffer = Buffer.from(text)
  retVal = buffer.toString('base64')
  return retVal
}

async function fromBase64 (text) {
  let retVal = ''
  const buffer = Buffer.from(text, 'base64')
  retVal = buffer.toString('ascii')
  return retVal
}

async function fileToStrings (filename) {
  let retVal = []
  const data = await fs.readFile(filename, 'binary')
  retVal = data.split('\n')
  return retVal
}

async function convertMP3toWAV (oldPath, newPath) {
  let ret = false

  try {
    await exec(`lame --decode ${oldPath} - | sox -v 0.5 -t wav - -t wav -b 16 -r 8000 -c 1 ${newPath}`)
    ret = true
  } catch (error) {
    console.log(error)
    ret = false
  }

  return ret
}

async function checkIfPathExists (path) {
  let ret = false

  try {
    await fs.access(path)
    ret = true
  } catch (error) {
    ret = false
  }

  return [path, ret]
}

async function createFileIfNotExists (path) {
  let ret = false

  try {
    await fs.access(path)
    ret = true
  } catch (error) {
    await fs.writeFile(path, '')
    ret = true
  }

  return ret
}

module.exports = {
  toBase64,
  fromBase64,
  fileToStrings,
  convertMP3toWAV,
  checkIfPathExists,
  createFileIfNotExists
}
