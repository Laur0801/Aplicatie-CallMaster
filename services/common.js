const fs = require('fs').promises

const {
  asteriskConfig,
  defaultUserConfig
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

async function getTrunks (count = false, isDefault = false) {
  return connect(async db => {
    if (count) {
      return await db.get('SELECT COUNT(*) as count FROM trunks')
    }

    if (isDefault) {
      return await db.get('SELECT * FROM trunks WHERE isDefault = 1')
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

async function getIVRs (isDefault = false) {
  return connect(async db => {
    if (isDefault) {
      return await db.all('SELECT * FROM ivr WHERE isDefault = 1')
    }

    return await db.all('SELECT * FROM ivr')
  })
}

async function commitChanges (startup = false) {
  if (startup === true) {
    const existPromiseArr = []
    for (const value of Object.values(defaultUserConfig)) {
      existPromiseArr.push(createFileIfNotExists(value))
    }

    const existArr = await Promise.all(existPromiseArr)
    for (const one of existArr) {
      if (!one) {
        return false
      }
    }
  }

  /* Check if there's a default gateway and IVR */
  let [defaultTrunk, defaultIVR] = await Promise.all([getTrunks(false, true), getIVRs(true)])
  let [includeTrunkChunk, dialoutChunk, ivrChunk, fromTrunkChunk] = ['', '', '', '']

  if (defaultTrunk !== [] && defaultTrunk !== undefined) {
    includeTrunkChunk = 'include => dialout\n\n'
    dialoutChunk = `[dialout]\nexten => _X.,1,DIAL(SIP/\${EXTEN}@${defaultTrunk.name})\nexten => _X.,n,Hangup()\n\nexten => _+X.,1,Dial(SIP/\${EXTEN}@${defaultTrunk.name})\nexten => _+X.,n,Hangup()\n\n`
  }

  if (defaultIVR !== [] && defaultIVR !== undefined) {
    defaultIVR = defaultIVR[0]
    fromTrunkChunk = `[from-siptrunk]\ninclude => sip_internal\nexten => _X.,1,ringing\nexten => _X.,n,Goto(${defaultIVR.context},s,1)\nexten => s,n,Hangup()\n\n`

    const parsedOptions = JSON.parse(defaultIVR.menumap)
    ivrChunk = `[${defaultIVR.context}]\ninclude => sip_internal\n\nexten => 0,1,Playback(${defaultIVR.timeout_audio})\nexten => 0,2,Playback(beep)\nexten => 0,3,Hangup()\n\nexten => s,1,Wait(1)\nexten => s,2,Background(${defaultIVR.greeting_audio})\nexten => s,3,Wait(2)\nexten => s,4,Background(${defaultIVR.prompt_audio})\nexten => s,5,WaitExten(${defaultIVR.timeout})\n\n`

    for (const option of parsedOptions) {
      if (option.type === 'extension') {
        ivrChunk += `exten => ${option.key},1,Dial(SIP/${option.do})\n`
      } else if (option.type === 'queue') {
        ivrChunk += `exten => ${option.key},1,Queue(${option.do})\n`
      }
    }

    ivrChunk += '\n'
    ivrChunk += `exten => i,1,Playback(${defaultIVR.invalid_audio})\nexten => i,2,Goto(s,3)\n\nexten => t,1,Goto(0,1)`
  }

  await Promise.all([
    fs.writeFile(asteriskConfig.sipConf, '[general]\nbindaddr=0.0.0.0\nbindport=5060\nallowguest=yes\nallow=all\nallow=ulaw\nallow=alaw\nallow=g722\nallow=g729\nallowguest=yes\nnat=no\ntcpenable=no'),
    fs.writeFile(asteriskConfig.extensionsConf, `${fromTrunkChunk}\n\n${ivrChunk}\n\n[sip_internal]\n${includeTrunkChunk}exten => _X.,1,Dial(SIP/$` + '{EXTEN}' + ')' + '\n'),
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

  for (let i = 0; i < extensions.length; i++) {
    finalOutputSip += `\n\n[${extensions[i].extension}]\ncallerid="${extensions[i].name}" <${extensions[i].extension}>\nsecret=${extensions[i].secret}\nallow=all\ntype=peer\ntrusttrpid=yes\nsendrpid=yes\nrpid_update=yes\nhost=dynamic\ncanreinvite=no\ncontext=sip_internal\ndtmfmode=rfc2833\ndtml=rfc2833\n`
  }

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

    if (trunks[i].user !== '') {
      portSecretStr += `user=${trunks[i].user}\n`
    }

    if (portSecretStr !== '') {
      codecsStr = codecsStr.slice(0, -1)
    }

    finalOutputSip += `\n\n[${trunks[i].name}]\ntype=${trunks[i].type}\ncontext=${trunks[i].context}\nhost=${trunks[i].host}\nqualify=${trunks[i].qualify}\ncanreinvite=${trunks[i].canreinvite}\ninsecure=${trunks[i].insecure}\ndisallow=all\n${codecsStr}\n${portSecretStr}`
  }

  for (let i = 0; i < queues.length; i++) {
    const members = queues[i].members.split(',')
    let membersStr = ''
    for (let i = 0; i < members.length; i++) {
      membersStr += `member => SIP/${members[i]}\n`
    }

    finalOutputQueues += `\n[${queues[i].name}]\nmusicclass=default\nstrategy=${queues[i].strategy}\ntimeout=${queues[i].timeout}\nwrapuptime=${queues[i].wrapuptime}\nautopause=${queues[i].autopause}\n${membersStr}`
  }

  finalOutputSip += '\n\n#include sip_zyvo_user.conf\n'
  finalOutputExtensions += `\n${dialoutChunk}\n\n#include extensions_zyvo_user.conf\n`
  finalOutputQueues += '#include queues_zyvo_user.conf\n'

  await Promise.all([
    fs.appendFile(asteriskConfig.sipConf, finalOutputSip),
    fs.appendFile(asteriskConfig.extensionsConf, finalOutputExtensions),
    fs.appendFile(asteriskConfig.queuesConf, finalOutputQueues),
    core('reload')
  ])
}

module.exports = {
  getIVRs,
  getTrunks,
  getExtensions,
  getQueues,
  commitChanges
}
