const express = require('express')
const app = express()
const PORT = 3000

const { initDb } = require('./db/db')
const { commitChanges } = require('./services/common')

const { logger } = require('./utils/logger/index')
const { asciiArt, checkIfAsteriskRunning } = require('./utils/defaults')

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.static('public'))

app.use('/api/extensions', require('./routes/extensions'))
app.use('/api/queues', require('./routes/queues'))
app.use('/api/trunks', require('./routes/trunks'))
app.use('/api/core', require('./routes/core'))

app.use('/advanced', require('./routes/advanced'))
app.use('/ivr', require('./routes/ivr'))
app.use('/', require('./routes/index'))

app.listen(PORT, async () => {
  await initDb()
  asciiArt()

  if (!(await checkIfAsteriskRunning())) {
    logger.error('Asterisk is not running. Please start it and try again.')
    console.log('\n')
    process.exit(0)
  }

  await commitChanges(true)
  logger.info(`Zyvo server listening on port ${PORT}`)
})
