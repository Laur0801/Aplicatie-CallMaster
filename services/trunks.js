const { connect } = require('../db/db')
const { getTrunks, commitChanges } = require('./common')

async function getMaxId () {
  return connect(async db => {
    return await db.get('SELECT MAX(id) as max FROM trunks')
  })
}

async function createTrunk (
  id,
  host,
  port,
  secret,
  user,
  codecs,
  gateway_extension,
  gateway_extension_password,
  default_action
) {
  return connect(async db => {
    const [
      exists
    ] = await Promise.all([
      db.get('SELECT * FROM trunks WHERE host = ?', [host])
    ])

    if (exists === undefined) {
      const gwName = `gw_${id}`
      const gwType = 'peer'
      const gwContext = 'from-siptrunk'
      const gwQualify = 'yes'
      const gwCanrenivite = 'no'
      const gwInsecure = 'port,invite'
      const gwPort = (port !== '') ? port : ''
      const gwSecret = (secret !== '') ? secret : ''
      const gwUser = (user !== '') ? user : ''
      const gatewayExtension = (gateway_extension !== '') ? gateway_extension : ''
      const gatewayExtensionPassword = (gateway_extension_password !== '') ? gateway_extension_password : ''
      const gwDefaultAction = (default_action !== '') ? default_action : ''

      await db.run('INSERT INTO trunks (id, name, type, context, host, port, secret, user, qualify, canreinvite, insecure, codecs, gateway_extension, gateway_extension_secret, default_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id,
        gwName,
        gwType,
        gwContext,
        host,
        gwPort,
        gwSecret,
        gwUser,
        gwQualify,
        gwCanrenivite,
        gwInsecure,
        codecs,
        gatewayExtension,
        gatewayExtensionPassword,
        gwDefaultAction])
      await commitChanges()
      return { error: false, created: true }
    } else {
      return { error: true, message: 'Trunk already exists' }
    }
  })
}

async function deleteTrunk (id) {
  return connect(async db => {
    await db.run('DELETE FROM trunks WHERE id = ?', [id])

    await reorder()
    await commitChanges()

    return { deleted: true }
  })
}

async function updateTrunk (id, host, port, secret, user, codecs, gateway_extension, gateway_extension_password, default_action) {
  return connect(async db => {
    try {
      await db.run(`UPDATE trunks SET host = '${host}', port = '${port}', secret = '${secret}', user = '${user}', codecs = '${codecs}', gateway_extension = '${gateway_extension}', gateway_extension_secret = '${gateway_extension_password}', default_action = '${default_action}' WHERE ID = ${id};`)
      await commitChanges()
    } catch (error) {
      console.log(error)
    }
  })
}

async function reorder () {
  const trunks = (await getTrunks())
  await connect(async db => {
    await db.run('DELETE FROM trunks')
    for (let i = 0; i < trunks.length; i++) {
      await db.run('INSERT INTO trunks (id, name, type, context, host, port, secret, user, qualify, canreinvite, insecure, codecs, gateway_extension, gateway_extension_secret, default_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [i,
        trunks[i].name,
        trunks[i].type,
        trunks[i].context,
        trunks[i].host,
        trunks[i].port,
        trunks[i].secret,
        trunks[i].user,
        trunks[i].qualify,
        trunks[i].canreinvite,
        trunks[i].insecure,
        trunks[i].codecs,
        trunks[i].gateway_extension,
        trunks[i].gateway_extension_secret,
        trunks[i].default_dial_extension,
        trunks[i].default_action])
    }
    await commitChanges()
  })
}

async function getOneTrunk (id) {
  return connect(async db => {
    return await db.get('SELECT * FROM trunks WHERE id = ?', [id])
  })
}

module.exports = {
  createTrunk,
  deleteTrunk,
  updateTrunk,
  getOneTrunk,
  getMaxId
}
