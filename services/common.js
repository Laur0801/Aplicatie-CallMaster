const fs = require('fs').promises

const {
  asteriskConfig
} = require('../utils/defaults')

const {
  createFileIfNotExists
} = require('../utils/utils')

const {
  connect
} = require('../db/db')

const {
  core
} = require('./core')

async function getExtensions (count = false) {
  return connect(async db => {
    if (count) {
      return await db.get('SELECT COUNT(*) as count FROM extensions')
    }
    return await db.all('SELECT * FROM extensions')
  })
}

async function getTrunks (count = false) {
  return connect(async db => {
    if (count) {
      return await db.get('SELECT COUNT(*) as count FROM trunks')
    }
    return await db.all('SELECT * FROM trunks')
  })
}

async function getQueues (count = false) {
  return connect(async db => {
    if (count) {
      return await db.get('SELECT COUNT(*) as count FROM queues')
    }
    return await db.all('SELECT * FROM queues')
  })
}

async function commitChanges (startup = false) {
  if (startup === true) {
    const existPromiseArr = []
    for (const value of Object.values(asteriskConfig)) {
      console.log(value)
      existPromiseArr.push(createFileIfNotExists(value))
    }

    const existArr = await Promise.all(existPromiseArr)
    for (const one of existArr) {
      if (!one) {
        console.log('')
        return false
      }
    }
  }

  await Promise.all([
    fs.writeFile(asteriskConfig.sipConf, '[general]\nbindaddr = 0.0.0.0\nbindport = 5060\nallowguest = yes\nallow = all\nallow = ulaw\nallow = alaw\nallow = g722\nallow = g729\nallowguest = yes\nnat = no\ntcpenable = no'),
    fs.writeFile(asteriskConfig.extensionsConf, ''),
    fs.writeFile(asteriskConfig.queuesConf, '')
  ])

  let finalOutputSip = ''
  let finalOutputExtensions = ''
  let finalOutputQueues = ''

  const [extensions,
    trunks,
    queues] = await Promise.all([
    getExtensions(),
    getTrunks(),
    getQueues()
  ])

  /* Writing zyvo-sip.conf */

  for (let i = 0; i < extensions.length; i++) {
    finalOutputSip += `\n[${extensions[i].extension}]\ncallerid="${extensions[i].name}" <${extensions[i].extension}>\nsecret=${extensions[i].secret}\nallow=all\ntype=peer\ntrusttrpid=yes\nsendrpid=yes\nrpid_update=yes\nhost=dynamic\ncanreinvite=no\ncontext=sip_internal\ndtmfmode=rfc2833\ndtml=rfc2833\n`
  }

  /* Writing zyvo-sip.conf */
  for (let i = 0; i < trunks.length; i++) {
    const codecsArr = trunks[i].codecs.split(',')
    let codecsStr = ''
    for (let i = 0; i < codecsArr.length; i++) {
      codecsStr += `allow=${codecsArr[i]}\n`
    }

    let portSecretStr = ''

    if (trunks[i].port !== '') {
      portSecretStr += `port=${trunks[i].port}\n`
    }

    if (trunks[i].secret !== '') {
      portSecretStr += `secret=${trunks[i].secret}\n`
    }

    if (portSecretStr !== '') {
      codecsStr = codecsStr.slice(0, -1)
    }

    finalOutputSip += `\n[${trunks[i].name}]\ntype=${trunks[i].type}\ncontext=${trunks[i].context}\nhost=${trunks[i].host}\nqualify=${trunks[i].qualify}\ncanreinvite=${trunks[i].canreinvite}\ninsecure=${trunks[i].insecure}\ndisallow=all\n${codecsStr}\n${portSecretStr}`
  }

  /* Writing zyvo-queues.conf */

  for (let i = 0; i < queues.length; i++) {
    const members = queues[i].members.split(',')
    let membersStr = ''
    for (let i = 0; i < members.length; i++) {
      membersStr += `member => SIP/${members[i]}\n`
    }

    finalOutputQueues += `\n[${queues[i].name}]\nmusicclass=default\nstrategy=${queues[i].strategy}\ntimeout=${queues[i].timeout}\nwrapuptime=${queues[i].wrapuptime}\nautopause=${queues[i].autopause}\n${membersStr}`
  }

  /* Writing zyvo-extensions.conf */

  finalOutputSip += '\n\n#include sip_zyvo_user.conf\n'
  finalOutputExtensions += '\n\n#include extensions_zyvo_user.conf\n'
  finalOutputQueues += '\n\n#include queues_zyvo_user.conf\n'

  await Promise.all([
    fs.appendFile(asteriskConfig.sipConf, finalOutputSip),
    fs.appendFile(asteriskConfig.extensionsConf, finalOutputExtensions),
    fs.appendFile(asteriskConfig.queuesConf, finalOutputQueues),
    core('reload')
  ])
}

module.exports = {
  getTrunks,
  getExtensions,
  getQueues,
  commitChanges
}
