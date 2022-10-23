const { promisify } = require('util')

const exec = promisify(require('child_process').exec)
const fs = require('fs').promises

const {
  asteriskConfig
} = require('../utils/defaults')

const {
  toBase64
} = require('../utils/utils')

async function core (action) {
  let retVal = true
  let stderr, stdout
  let ran

  try {
    if (action === 'restart') {
      ran = await exec('asterisk -rx "core restart now"')
    } else if (action === 'reload') {
      ran = await exec('asterisk -rx "core reload"')
    } else if (action === 'stop') {
      ran = await exec('asterisk -rx "core stop now"')
    }

    stderr = ran.stderr
    stdout = ran.stdout
  } catch (error) {
    stderr = error.message
  }

  if (stderr !== '') {
    retVal = false
  }

  if (stdout !== '') {
    retVal = true
  }

  return retVal
}

async function getUptime () {
  let retVal = 0

  try {
    const uptimeData = await exec('asterisk -rx "core show uptime"')
    const data = uptimeData.stdout.split('\n')

    const uptime = ((data[0]).replace('System uptime: ', '')).split(',')[0]
    const lastReload = ((data[1]).replace('Last reload: ', '')).split(',')[0]

    retVal = {
      uptime,
      lastReload
    }
  } catch (error) {
    return retVal
  }

  return retVal
}

async function coreExecute (command) {
  let output

  command = command.replace(/"/g, '')
  let commRun

  try {
    commRun = await exec(`asterisk -rx "${command}"`)
    output = commRun.stdout
  } catch (error) {
    output = commRun.stderr
    return output
  }

  return output
}

async function getCoreConfig () {
  let [
    sipConfData,
    extensionsConfData
  ] = await Promise.all([
    fs.readFile(asteriskConfig.sipConf, 'binary'),
    fs.readFile(asteriskConfig.extensionsConf, 'binary')
  ]);

  [
    sipConfData,
    extensionsConfData
  ] = await Promise.all([
    toBase64(sipConfData),
    toBase64(extensionsConfData)
  ])

  return {
    sipConf: sipConfData,
    extensionsConf: extensionsConfData
  }
}

module.exports = {
  core,
  getUptime,
  coreExecute,
  getCoreConfig
}
