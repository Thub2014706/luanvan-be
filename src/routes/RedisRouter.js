const express = require('express')
const redisController = require('../controllers/RedisController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/hold-seat', redisController.holdSeat);
router.get('/all-hold', redisController.allHold);
router.delete('/cancel-hold', redisController.cancelHold);
router.delete('/cancel-all-hold', redisController.cancelAllHold);
router.post('/hold-pay', redisController.holdPay);
router.get('/test-hold', redisController.testHold);

module.exports = router