'use strict'

const User = require('../models/user')
const { isValid } = require('mongoose').Types.ObjectId

exports.findHashById = async userId => {
  console.log('this id was passed to hashhelper:', userId)
  
  try {
    if (!isValid(userId)) throw new Error('misiganes')
    const result = await User.findById(userId).select('hash.hash')
    const { hash: { hash = null } = null } = result
    return hash
  } catch (e) { return e }
}

exports.deleteUserById = async userId => {
  console.log('this id was passed to deletehelper:', userId)
  try {
    if (!isValid(userId)) throw new Error('misiganes2')
    const result = await User.findByIdAndRemove(userId)
    console.log('see kustutati ära:', result)

    return result
  } catch (e) { return e }
}

  