const cron = require('node-cron');
const { storeStats } = require('./stats');
const { checkIfAsteriskRunning } = require('./ami');

const task = cron.schedule('*/5 * * * *', async () => { // Modificat pentru a rula din 5 în 5 minute
  const asteriskIsActive = await checkIfAsteriskRunning();
  if (asteriskIsActive) {
    await storeStats();
  } else {
    console.log('Asterisk nu rulează, sarcinile nu vor fi executate.');
  }
});

async function startCron() {
  task.start();
}

module.exports = {
  startCron

};