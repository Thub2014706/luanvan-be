const express = require('express')
const seatController = require('../controllers/SeatController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.put('/update-row', middlewares.theaterAccuracy, seatController.updateRow);
router.get('/detail/:id', seatController.detailSeat);
router.get('/', seatController.allSeatRoom);
router.patch('/:id', middlewares.theaterAccuracy, seatController.updateSeat);
router.patch('/delete-seat/:id', middlewares.theaterAccuracy, seatController.deleteSeat);

module.exports = router