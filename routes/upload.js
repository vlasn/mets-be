const router = require('express').Router()
      multer = require('multer')
      helper = require('./helper.js')
      responseFactory = helper.responseFactory
      path = require('path')
      loc = path.resolve(__dirname, `../uploaded_files/`),
      storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, loc)
        },
        filename: function (req, file, cb) {
        	let name = file.originalname.split('.').shift()
        	let ext = "." + file.originalname.split('.').pop()
          cb(null, name + '_' + Date.now() + ext)
        }
      }),
      upload = multer({
      	storage: storage,
      	fileFilter: function (req, file, cb) {
          if (path.extname(file.originalname) !== '.pdf') return cb(new Error('Only pdfs are allowed'))
          cb(null, true)
        }
      }).fields([{ name: 'leping', maxCount: 1 }, { name: 'metsateatis', maxCount: 1 }])
      //}).single('leping')

//const upload = multer({ dest: loc }).single('leping')
// tuleb saata ilma headeriteta
router.post('/leping', (req, res)=>{
    upload(req, res, function (err) {

      if (err) {
        console.log(err)
        res.status(500).json(responseFactory("reject","Something went wrong... :("))
      }
      console.log(req.body)
      res.status(200).json(responseFactory("accept","File was uploaded!"))
    })

})

router.post('/metsateatis', function (req, res) {
	upload(req, res, function (err) {
    if (err){
    	console.log(err)
    	res.status(500).json(responseFactory("reject","Something went wrong... :("))
   	}
    console.log(req.body)
    res.status(200).json(responseFactory("accept","File was uploaded!"))
  })
})

module.exports = router

