const express = require('express')
const redisController = require('../controllers/RedisController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.get('/', redisController.getRedis);

module.exports = router