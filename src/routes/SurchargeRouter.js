const express = require('express')
const surchargeController = require('../controllers/SurchargeController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.put('/', middlewares.priceAccuracy, surchargeController.addSurcharge);
router.get('/detail', surchargeController.detailSurcharge);

module.exports = router