const winston = require('winston');

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
    myFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

module.exports = logger;
