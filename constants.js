_Error = require(`./utils/error`)

module.exports = {
    ERROR_MISSING_REQUIRED_PARAMS : new _Error(`Missing required parameters`, 400),
    ERROR_MONGODB_QUERY_FAILED: new _Error(`MongoDB query failed`, 500)
}