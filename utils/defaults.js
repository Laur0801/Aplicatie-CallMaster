const { exec } = require('child_process')

const figlet = require('figlet')
const defaultError = { error: true }
const pjson = require('../package.json')

const asteriskConfig = {
  sipConf: '/etc/asterisk/sip.conf',
  extensionsConf: '/etc/asterisk/extensions.conf',
  queuesConf: '/etc/asterisk/queues.conf'
}

const defaultUserConfig = {
  sipConf: '/etc/asterisk/sip_zyvo_user.conf',
  extensionsConf: '/etc/asterisk/extensions_zyvo_user.conf',
  queuesConf: '/etc/asterisk/queues_zyvo_user.conf'
}

async function asciiArt () {
  return new Promise((resolve, reject) => {
    figlet('Zyvo', function (err, data) {
      if (err) {
        console.log(`Zyvo v${pjson.version}`)
      }
      console.log(`${data}\n\tv${pjson.version} by ${(pjson.author).split(' ')[0]}\n`)
    })
  })
}

async function checkIfAsteriskRunning () {
  return new Promise((resolve, reject) => {
    exec('ps -A | grep asterisk', (err, stdout, stderr) => {
      if (err) {
        resolve(false)
      }
      if (stdout) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

module.exports = {
  asciiArt,
  defaultError,
  asteriskConfig,
  defaultUserConfig,
  checkIfAsteriskRunning
}
