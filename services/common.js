/* eslint no-template-curly-in-string: 0*/

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

const {
  logger
} = require('../utils/logger')

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

async function getIVRs (isDefault = false) {
  return connect(async db => {
    if (isDefault) {
      return await db.all('SELECT * FROM ivr WHERE isDefault = 1')
    }

    return await db.all('SELECT * FROM ivr')
  })
}

async function getSettings () {
  return connect(async db => {
    return await db.get('SELECT * FROM settings')
  })
}

async function commitFsCheck () {
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

  let managerConfStr = ''
  managerConfStr += '[general]\n'
  managerConfStr += 'enabled=yes\n'
  managerConfStr += 'port=5038\n'
  managerConfStr += 'bindaddr=0.0.0.0\n\n'

  managerConfStr += '[admin]\n'
  managerConfStr += 'secret=zyvo\n'
  managerConfStr += 'permit=0.0.0.0/0.0.0.0\n'
  managerConfStr += 'read = all,system,call,user,dtmf\n'
  managerConfStr += 'write = all,system,call,user,dtmf\n'

  let moduleConfStr = ''
  moduleConfStr += '[modules]\n'
  moduleConfStr += 'autoload=yes\n\n'
  moduleConfStr += 'require => chan_sip.so\n'

  await Promise.all([
    fs.writeFile(asteriskConfig.managerConf, managerConfStr),
    fs.writeFile(asteriskConfig.modulesConf, moduleConfStr)
  ])

  return true
}

async function writeSipConf () {
  const [
    trunks,
    extensions,
    settings
  ] = await Promise.all([
    getTrunks(),
    getExtensions(),
    getSettings()
  ])

  let finString = ''

  finString += '[general]\n'
  finString += `bindaddr=${settings.bind_ip}\n`
  finString += `bindport=${settings.bind_port}\n`
  finString += 'allowguest=yes\n'
  finString += 'allow=all\n'
  finString += 'allow=ulaw\n'
  finString += 'allow=alaw\n'
  finString += 'allow=g722\n'
  finString += 'allow=g729\n'
  finString += 'allowguest=yes\n'
  finString += 'nat=no\n'
  finString += 'tcpenable=no\n'

  let extenStr = ''

  for (const extension of extensions) {
    extenStr += `\n\n[${extension.extension}]\n`
    extenStr += `callerid="${extension.name}" <${extension.extension}>\n`
    extenStr += `secret=${extension.secret}\n`
    extenStr += 'allow=all\n'
    extenStr += 'type=peer\n'
    extenStr += 'trusttrpid=yes\n'
    extenStr += 'sendrpid=yes\n'
    extenStr += 'rpid_update=yes\n'
    extenStr += 'host=dynamic\n'
    extenStr += 'canreinvite=no\n'
    extenStr += 'context=sip_internal\n'
    extenStr += 'dtmfmode=rfc2833\n'
    extenStr += 'dtml=rfc2833\n'
  }

  finString += extenStr

  let trunkStr = ''
  for (const trunk of trunks) {
    trunkStr += `\n\n[${trunk.name}]\n`
    trunkStr += 'type=peer\n'
    trunkStr += 'context=from-siptrunk\n'
    trunkStr += `host=${trunk.host}\n`
    trunkStr += 'qualify=yes\n'
    trunkStr += 'canreinvite=no\n'
    trunkStr += 'insecure=port,invite\n'
    trunkStr += 'disallow=all\n'

    const codecsArr = trunk.codecs.split(',')

    for (const codec of codecsArr) {
      trunkStr += `allow=${codec}\n`
    }

    if (trunk.user !== '' && trunk.user !== undefined && trunk.user !== null) {
      trunkStr += `user=${trunk.user}\n`
    }

    if (trunk.secret !== '' && trunk.secret !== undefined && trunk.secret !== null) {
      trunkStr += `secret=${trunk.secret}\n`
    }

    trunkStr += `\n\n[${trunk.gateway_extension}]\n`
    trunkStr += `callerid="${trunk.gateway_extension}" <${trunk.gateway_extension}>\n`
    trunkStr += `secret=${trunk.gateway_extension_secret}\n`
    trunkStr += 'type=peer\n'
    trunkStr += 'host=dynamic\n'
    trunkStr += 'context=from-siptrunk\n'
    trunkStr += 'canreinvite=no\n'
    trunkStr += 'dtmfmode=rfc2833\n'
    trunkStr += 'dtml=rfc2833\n'
  }

  finString += trunkStr
  finString += '\n\n#include sip_zyvo_user.conf\n'

  await fs.writeFile(asteriskConfig.sipConf, finString)
}

async function writeExtensionsConf () {
  let [
    fromTrunkToExtenStr,
    fromTrunkToIvrStr,
    fromTrunkToQueueStr,
    finString
  ] = [
    '',
    '',
    '',
    ''
  ]

  const [
    trunks,
    ivrs,
    extensions
  ] = await Promise.all([
    getTrunks(),
    getIVRs(),
    getExtensions()
  ])

  let globDefaultAction

  for (const trunk of trunks) {
    const defaultAction = (JSON.parse(trunk.default_action))
    globDefaultAction = defaultAction
    if (defaultAction.do === 'Extension') {
      fromTrunkToExtenStr += '\n\n[from-siptrunk]\ninclude => sip_internal\n'
      fromTrunkToExtenStr += `exten => _X.,1,GotoIf($[${trunk.gateway_extension} = \${EXTEN}]?passed:failed)\n`
      fromTrunkToExtenStr += `exten => _X.,n(passed),Dial(SIP/${defaultAction.id})\n`
      fromTrunkToExtenStr += 'exten => _X.,n(failed),Hangup()\n'
    }

    if (defaultAction.do === 'IVR') {
      fromTrunkToIvrStr += '\n\n[from-siptrunk]\ninclude => sip_internal\n'
      fromTrunkToIvrStr += 'exten => _X.,1,Verbose(0, Exten is ${EXTEN}) \n'
      fromTrunkToIvrStr += `exten => _X.,n,GotoIf($[${trunk.gateway_extension} = \${EXTEN}]?passed:failed)\n`
      fromTrunkToIvrStr += `exten => _X.,n(passed),Goto(ivr_${defaultAction.id},s,1)\n`
      fromTrunkToIvrStr += 'exten => _X.,n(failed),Hangup()\n\n'

      fromTrunkToIvrStr += `[ivr_${defaultAction.id}]\n`
      fromTrunkToIvrStr += 'include => sip_internal\n'

      const selectedIvr = ivrs.find(ivr => ivr.name === defaultAction.id)

      fromTrunkToIvrStr += `exten => 0,1,Playback(${selectedIvr.timeout_audio})\n`
      fromTrunkToIvrStr += 'exten => 0,2,Hangup()\n\n'

      fromTrunkToIvrStr += 'exten => s,1,Set(loop=0)\n'
      fromTrunkToIvrStr += 'exten => s,2,Set(loop=$[${loop}+1])\n'
      fromTrunkToIvrStr += 'exten => s,3,Answer(1500)\n'
      fromTrunkToIvrStr += `exten => s,4,Background(${selectedIvr.greeting_audio})\n`
      fromTrunkToIvrStr += 'exten => s,5,Wait(2)\n'
      fromTrunkToIvrStr += `exten => s,6,Background(${selectedIvr.prompt_audio})\n`
      fromTrunkToIvrStr += `exten => s,7,WaitExten(${selectedIvr.timeout})\n\n`

      for (const option of JSON.parse(selectedIvr.menumap)) {
        if (option.type === 'extension') {
          fromTrunkToIvrStr += `exten => ${option.key},1,Dial(SIP/${option.do})\n`
        } else if (option.type === 'queue') {
          fromTrunkToIvrStr += `exten => ${option.key},1,Queue(${option.do})\n`
        }
      }

      fromTrunkToIvrStr += '\n'
      fromTrunkToIvrStr += `exten => i,1,Playback(${selectedIvr.invalid_audio})\n`
      fromTrunkToIvrStr += 'exten => i,2,GotoIf($[${loop}<2]?s,2)\n'
      fromTrunkToIvrStr += 'exten => i,3,Goto(s,3)\n\n'

      fromTrunkToIvrStr += 'exten => t,1,GotoIf($[${loop}<2]?s,2)\n'
      fromTrunkToIvrStr += 'exten => t,2,Goto(0,1)\n\n'
    }

    if (defaultAction.do === 'Queue') {
      fromTrunkToQueueStr += '\n\n[from-siptrunk]\ninclude => sip_internal\n'
      fromTrunkToQueueStr += `exten => _X.,1,GotoIf($[${trunk.gateway_extension} = \${EXTEN}]?passed:failed)\n`
      fromTrunkToQueueStr += `exten => _X.,n(passed),Queue(${defaultAction.id})\n`
      fromTrunkToQueueStr += 'exten => _X.,n(failed),Hangup()\n'
    }
  }

  let extensionsStr = ''
  extensionsStr += '\n\n[sip_internal]\n'
  extensionsStr += 'include => dialout\n'

  for (const extension of extensions) {
    extensionsStr += `exten => ${extension.extension},1,Dial(SIP/${extension.extension})\n`
  }

  extensionsStr += `exten => 1999,1,Goto(ivr_${globDefaultAction.id},s,1)\n`

  let dialoutStr = '\n\n[dialout]\n'
  dialoutStr += 'exten => _X.,1,AGI(agi://localhost:3333)\n'

  const includeStr = '\n\n#include extensions_zyvo_user.conf\n'

  finString += fromTrunkToExtenStr
  finString += fromTrunkToIvrStr
  finString += fromTrunkToQueueStr
  finString += extensionsStr
  finString += dialoutStr
  finString += includeStr

  await fs.writeFile(asteriskConfig.extensionsConf, finString)
}

async function writeQueuesconf () {
  const queues = await getQueues()
  let finString = ''

  for (const queue of queues) {
    const members = queue.members.split(',')

    let membersStr = ''
    for (const member of members) {
      membersStr += `member => SIP/${member}\n`
    }

    finString += `\n\n[${queue.name}]\n`
    finString += 'musicclass=default\n'
    finString += `strategy=${queue.strategy}\n`
    finString += `timeout=${queue.timeout}\n`
    finString += `wrapuptime=${queue.wrapuptime}\n`
    finString += `autopause=${queue.autopause}\n`
    finString += `${membersStr}`
  }

  finString += '\n\n#include queues_zyvo_user.conf\n'

  await fs.writeFile(asteriskConfig.queuesConf, finString)
}

async function commitChanges (startup = false) {
  if (startup === true) {
    const fsCheck = await commitFsCheck()
    if (!fsCheck) {
      console.log('Error: Filesystem check failed')
      process.exit(1)
    }

    logger.info('Wrote configuration files for asterisk')
  }

  await Promise.all([
    writeSipConf(),
    writeExtensionsConf(),
    writeQueuesconf()
  ])

  core('reload')
}

module.exports = {
  getIVRs,
  getTrunks,
  getExtensions,
  getQueues,
  commitChanges
}
