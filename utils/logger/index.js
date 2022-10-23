const { createLogger, format, transports } = require('winston')
const { combine, splat, timestamp, printf } = format

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const msg = `${timestamp} [${level}] : ${message}`
  return msg
})

const logger = createLogger({
  level: 'debug',
  format: combine(
    format.colorize(),
    splat(),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: 'logs/zyvo.log', level: 'debug', maxsize: 5242880 })
  ]
})

module.exports = {
  logger
}
