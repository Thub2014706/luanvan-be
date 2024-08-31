const express = require('express')
const priceController = require('../controllers/PriceController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.put('/', middlewares.priceAccuracy, priceController.addPrice);
router.get('/detail', priceController.detailPrice);
router.get('/detail-by-user', priceController.detailPriceByUser);

module.exports = router