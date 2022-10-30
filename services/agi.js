const {
  logger
} = require('../utils/logger')

const {
  getSettings
} = require('./advanced')

const workingGateways = []

const AGIServer = require('ding-dong')
const ami = require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'zyvo', true)
ami.keepConnected()

async function actionSipPeers () {
  ami.action({ action: 'SIPpeers' }, function () {})
}

ami.on('managerevent', function (evt) {
  if (evt.objectname !== undefined) {
    if ((evt.objectname).includes('gw_')) {
      if ((evt.status).includes('OK')) {
        workingGateways.push(evt.objectname)
      }
    }
  }
})

const handler = function (context) {
  context.onEvent('variables').then(async function (vars) {
    const numberToCall = vars.agi_dnid
    const prefix = (numberToCall).toString()[0]
    const rmPrefix = numberToCall.substring(1)
    const rawSettings = await getSettings()

    let gateway = ''

    if (rawSettings.default_gateway_map === '') {
      gateway = workingGateways[0]
    } else {
      const gwSettings = JSON.parse((rawSettings).default_gateway_map)
      gateway = Object.keys(gwSettings).find(key => gwSettings[key] === prefix)
    }

    logger.info(`Calling SIP/${rmPrefix}`)
    context.exec('Dial', `SIP/${rmPrefix}@${gateway}`, '60', 'tT').then(function (res) {
      context.end()
    })
  })
}

const agi = new AGIServer(handler)
agi.start(3333)

module.exports = {
  workingGateways,
  actionSipPeers
}
