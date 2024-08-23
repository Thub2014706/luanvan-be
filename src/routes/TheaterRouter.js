const express = require('express')
const theaterController = require('../controllers/TheaterController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.theaterAccuracy, theaterController.addTheater);
router.post('/update/:id', middlewares.theaterAccuracy, theaterController.updateTheater);
router.get('/detail/:id', theaterController.detailTheater);
router.get('/', theaterController.allTheater);
router.patch('/status/:id', middlewares.theaterAccuracy, theaterController.statusTheater);
router.patch('/delete/:id', middlewares.theaterAccuracy, theaterController.deleteTheater);
router.get('/list', theaterController.listTheater);

module.exports = router