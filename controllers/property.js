const Property = require('../models/property')
const asyncMiddleware = require('../utils/asyncMiddleware')

/**
{
  name: String,
  cadastreIds: [String],
  location: String,
}
 */

exports.create = async (name, cadastreIds, location) => {
    const property = await Property.create({
        name,
        cadastreIds,
        location
    })
    return property
}