const express = require('express')
const momoController = require('../controllers/MomoController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/payment-ticket', momoController.momoTicket);
router.post('/payment-combo', momoController.momoCombo);
router.post('/callback-ticket', momoController.callbackTicket);
router.post('/callback-combo', momoController.callbackCombo);
router.post('/check-status-transaction', momoController.checkStatus);

module.exports = router