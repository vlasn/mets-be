'use strict'

module.exports = (
  status = 500,
  message = 'An error occurred',
  stack = undefined
) => {
  throw Object.assign(new Error(message), { status }, { stack })
}
