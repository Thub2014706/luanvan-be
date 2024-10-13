const express = require('express')
const AdvertisementController = require('../controllers/AdvertisementController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.AdvertisementAccuracy, AdvertisementController.addAdvertisement);
router.put('/', middlewares.AdvertisementAccuracy, AdvertisementController.updateAdvertisement);
router.patch('/status/:id', middlewares.AdvertisementAccuracy, AdvertisementController.statusAdvertisement);
router.get('/all', AdvertisementController.allAdvertisement);
router.get('/detail/:id', AdvertisementController.detailAdvertisement);

module.exports = router