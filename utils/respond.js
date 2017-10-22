'use strict'

module.exports = function (res, data = null) {
  res.status(200).json({ success: true, data })
}
