'use strict'

const multer = require('multer'),
path = require('path'),
fs = require('fs')


    let fileNames = []
    const loc = path.resolve(__dirname, `../uploaded_files/`),
    storage = multer.diskStorage({
        destination: loc,
        filename: (req, file, cb) => {
            const name = file.originalname.split('.').shift(),
            ext = path.extname(file.originalname),
            fname = name + '_' + Date.now() + ext
            fileNames = [fname, ...fileNames]
            cb(null, fname)
        }
    }),
    upload = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (path.extname(file.originalname) !== '.pdf') return cb(null, false)
            cb(null, true)
        }
    }),
    documentsUpload = upload.array('documents', 6)

module.exports = documentsUpload
