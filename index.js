const express = require('express')
const app = express()
const PORT = 3000

const { initDb } = require('./db/db')
const { commitChanges } = require('./services/common')

const { logger } = require('./utils/logger/index')

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
  await commitChanges(true)
  logger.info(`Zyvo server listening on port ${PORT}`)
})
