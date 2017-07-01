const router = require('express').Router()

router.use('*', require('./auth/token').verify)
router.use('/auth', require('./auth'))
router.use('/users', require('./users'))
router.use('/contracts', require('./contracts'))
router.use('/pricelists', require('./pricelists'))
router.use('/reports', require('./reports'))
router.use('/upload', require('./upload'))

module.exports = router