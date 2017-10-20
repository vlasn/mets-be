'use strict'

const crypto = require('crypto')

module.exports = () => crypto.createHash('sha256').update(Date.now().toString()).digest('hex')