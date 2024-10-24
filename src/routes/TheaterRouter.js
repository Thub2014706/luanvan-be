const express = require('express')
const theaterController = require('../controllers/TheaterController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.theaterAccuracy, upload.single("image"), theaterController.addTheater);
router.post('/update/:id', middlewares.theaterAccuracy, upload.single("image"), theaterController.updateTheater);
router.get('/detail/:id', theaterController.detailTheater);
router.get('/', theaterController.allTheater);
router.patch('/status/:id', middlewares.theaterAccuracy, theaterController.statusTheater);
router.patch('/delete/:id', middlewares.theaterAccuracy, theaterController.deleteTheater);
router.get('/list', theaterController.listTheater);
router.get('/list-province', theaterController.listProvince);
router.get('/list-by-province', theaterController.listTheaterByProvince);
router.get('/length-room/:id', theaterController.lengthRoomByTheater);
router.get('/length-seat/:id', theaterController.lengthSeatByTheater);

module.exports = router