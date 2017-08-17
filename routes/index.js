'use strict'

const router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('*', require('../utils/token').verify)
router.use('/users', require('./users'))
router.use('/contracts', require('./contracts'))
router.use('/pricelists', require('./pricelists'))
router.use('/reports', require('./reports'))
router.use('/upload', require('./upload'))
//router.use('/upload/pdf', (req,res) => pdf(res))

module.exports = router