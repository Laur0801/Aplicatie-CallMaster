const cron = require('node-cron')
const { storeStats } = require('./stats')
const { actionSipPeers } = require('./agi')

const task = cron.schedule('* * * * *', () => {
  storeStats()
  actionSipPeers()
})

async function startCron () {
  task.start()
}

module.exports = {
  startCron
}
