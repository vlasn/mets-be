module.exports = {
  'VALIDATION_ERROR' : function(err) {
    const errors = Object.values(err.errors).map(error => error.message).join(', ')
    const validationError = new Error(errors)
    validationError.stack = err
    validationError.status = 400
    return validationError
  },
  'DUPLICATION_ERROR' : function(err) {
    const duplicationError = new Error('duplicate key')
    duplicationError.stack = err
    duplicationError.status = 409
    return duplicationError
  },
  'DATABASE_ERROR' : function(err) {
    const databaseError = new Error('database query failed')
    databaseError.stack = err
    return databaseError
  },
  'USER_AUTHENTICATION_ERROR' : function() {
    const userAuthenticationError = new Error('authentication failed')
    userAuthenticationError.status = 401
    return userAuthenticationError
  },
  'USER_VALIDATION_ERROR' : userValidationError(),
  'MISSING_PARAMS_ERROR' : missingParamsError()
}

function missingParamsError() {
  const error = new Error('missing required params')
  error.status = 400
  return error
}

function userValidationError() {
  const error = new Error('validation failed')
  error.status = 400
  return error
}