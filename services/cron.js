const cron = require('node-cron')
const { storeStats } = require('./stats')

const task = cron.schedule('* * * * *', () => {
  storeStats()
})

async function startCron () {
  task.start()
}

module.exports = {
  startCron
}
