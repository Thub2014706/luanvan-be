const express = require('express')
const seatController = require('../controllers/SeatController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/update-row', seatController.updateRow);

module.exports = router