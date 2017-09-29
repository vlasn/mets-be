_Error = require(`./utils/error`)

module.exports = {
    MISSING_REQUIRED_PARAMS : new _Error('Missing required parameter(s)', 400),
    INVALID_PARAMS : new _Error('Invalid parameter(s)', 400),
    MONGODB_QUERY_FAILED: new _Error('MongoDB query failed', 500)
}