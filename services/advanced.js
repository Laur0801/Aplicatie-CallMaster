const fs = require('fs').promises

const { asteriskConfig } = require('../utils/defaults')
const { fileToStrings } = require('../utils/utils')
const { commitChanges } = require('./common')

async function getSettings () {
  const { sipConf } = asteriskConfig
  const [sipConfStrings] = await Promise.all([
    fileToStrings(sipConf)
  ])

  const [bindAddress, bindPort] = await Promise.all([
    (sipConfStrings.find(line => line.includes('bind='))).split('=')[1],
    (sipConfStrings.find(line => line.includes('bindport='))).split('=')[1]
  ])

  return {
    bindAddress,
    bindPort
  }
}

async function setCoreSettings (bindAddr, bindPort) {
  const { sipConf } = asteriskConfig
  const [sipConfStrings] = await Promise.all([
    fileToStrings(sipConf)
  ])

  const sipConfStringsNew = sipConfStrings.map(line => {
    if (line.includes('bind=')) {
      return `bind=${bindAddr}`
    } else if (line.includes('bindport=')) {
      return `bindport=${bindPort}`
    } else {
      return line
    }
  })

  const sipConfStr = sipConfStringsNew.join('\n')
  await fs.writeFile(sipConf, sipConfStr)
  await commitChanges()
}

module.exports = {
  getSettings,
  setCoreSettings
}
