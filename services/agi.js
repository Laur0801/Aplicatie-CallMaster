const workingGateways = []

const AGIServer = require('ding-dong')
const ami = require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'unwinddaftpuffin', true)
ami.keepConnected()
ami.action({ action: 'SIPpeers' }, function () {})

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
  context.onEvent('variables').then(function (vars) {
    let toCall = vars.agi_dnid
    toCall = toCall.substring(1)
    context.exec('Dial', `SIP/${toCall}@${workingGateways[0]}`, '60', 'tT').then(function (res) {
      context.end()
    })
  })
}

const agi = new AGIServer(handler)
agi.start(3333)
