const { connect } = require('../db/db')
const { commitChanges } = require('./common')

async function getSettings () {
  return connect(async db => {
    const settings = await db.get('SELECT * FROM settings')
    return settings
  })
}

async function setCoreSettings (bindAddr, bindPort, gatewayMap) {
  return connect(async db => {
    const hostBindAddr = bindAddr
    const hostBindPort = bindPort
    const hostGwMap = gatewayMap

    await db.run('UPDATE settings SET bind_ip = ?, bind_port = ?, default_gateway_map = ?', [hostBindAddr, hostBindPort, hostGwMap])
    await commitChanges()
  })
}

module.exports = {
  getSettings,
  setCoreSettings
}
