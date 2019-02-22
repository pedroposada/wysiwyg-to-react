import Pino from 'pino'

// LEVELS

// 'silent'
// 'fatal'
// 'error'
// 'warn'
// 'info'
// 'debug'
// 'trace'

const logger = Pino({ prettyPrint: true })

logger.level = 'trace'

// USAGE EXAMPLE:

// logger.debug('comment', obj, array, ...)
// logger.error(...)
// logger.fatal(...)
// logger.info(...)

const wrapper = level => (...data) => {
  logger[level].apply(logger, data)
}

export default {
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  trace: logger.trace.bind(logger),
  warn: logger.warn.bind(logger),
  error: wrapper('error'),
  fatal: wrapper('fatal')
}
