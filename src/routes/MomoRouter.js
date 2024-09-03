const express = require('express')
const momoController = require('../controllers/MomoController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/payment', momoController.momoPost);
router.post('/callback', momoController.callback);
router.post('/check-status-transaction', momoController.checkStatus);

module.exports = router