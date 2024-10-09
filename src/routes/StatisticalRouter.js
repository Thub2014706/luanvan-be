const express = require('express')
const statisticalController = require('../controllers/StatisticalController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.get('/daily-revenue', statisticalController.dailyRevenue);
// router.get('/detail', surchargeController.detailSurcharge);
// router.get('/detail-by-type', surchargeController.detailSurchargeByType);

module.exports = router