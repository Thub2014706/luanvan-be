const express = require('express')
const theaterController = require('../controllers/TheaterController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', theaterController.addTheater);
router.put('/update/:id', theaterController.updateTheater);
router.get('/detail/:id', theaterController.detailTheater);
router.get('/', theaterController.allTheater);
router.patch('/status/:id', theaterController.statusTheater);
router.delete('/:id', theaterController.deleteTheater);

module.exports = router