'use strict'

const multer = require('multer')
const path = require('path')
const loc = path.resolve(__dirname, `../uploaded_files/`)
const storage = multer.diskStorage({
  destination: loc,
  filename: (req, file, cb) => {
    const name = file.originalname
      .split('.')
      .shift()
    const ext = path.extname(file.originalname)
    const fname = name + '_' + Date.now() + ext
    file.saveLocation = loc + '/' + fname
    cb(null, fname)
  }
})
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.pdf') return cb(null, false)
    cb(null, true)
  }
})
const documentsUpload = upload.fields([
  { name: 'other', maxCount: 5 },
  { name: 'contracts', maxCount: 5 },
  { name: 'forestNotices', maxCount: 5 }
])

module.exports = documentsUpload
