'use strict'

const { VALIDATION_ERROR,
    DUPLICATION_ERROR,
    DATABASE_ERROR } = require('../errors')

module.exports = function (err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
}
