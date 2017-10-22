module.exports = {
  'VALIDATION_ERROR': function (err) {
    const errors = Obj
    const validationError = new Error(errors[0])
    validationError.stack = err
    validationError.status = 400
    return validationError
  },
  'DUPLICATION_ERROR': function (err) {
    const duplicationError = new Error('duplicate key')
    duplicationError.stack = err
    duplicationError.status = 409
    return duplicationError
  },
  'DATABASE_ERROR': function (err) {
    const databaseError = new Error('database query failed')
    databaseError.stack = err
    return databaseError
  },
  'MISSING_PARAMS_ERROR': newError(400, 'missing required params'),
  newError: function (status = 500, message = 'something went wrong') {
    const error = new Error(message)
    error.status = status
    return error
  }
}

const AUTHENTICATION_ERROR = newError(401, 'authentication failed')
const DB_DUPLICATION_ERROR = msg => newError(409, msg)
// const DB_VALIDATION_ERROR = newError(400, Object.values(err.errors).map(error => error.message)[0], )
console.log(AUTHENTICATION_ERROR)

const errWoStack = error => { return { error } }

const createErr = (error, stack) => { return { error, stack } }

const dodamagic = error => stack => createErr(error, stack)

function newError (status = 500, message = 'something went wrong', stack) {
  const error = new Error(message)
  error.status = status
  error.stack = stack
  return error
}
