const defaultError = { error: true }

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

module.exports = {
  defaultError,
  asteriskConfig,
  defaultUserConfig
}
