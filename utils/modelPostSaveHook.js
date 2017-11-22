'use strict'

const error = require('../utils/error')
const asyncMiddleware = require('../utils/asyncMiddleware')

module.exports = asyncMiddleware(async function (err, doc, next) {
  const errors = {
    MongoError: err.code === 11000 &&
      err.message.includes('email') &&
      next(error(409, 'E-mail is in use')),
    ValidationError: next(error(400, getFirstValidationErrorMessage(err))),
    default: next(error(500, 'A database error occurred'))
  }

  return errors[err.name] || errors['default']
})

function getFirstValidationErrorMessage (validationError) {
  return (Object.values(validationError.errors)
    .map(error => error.message))[0] || 'Mongoose validation error'
}
