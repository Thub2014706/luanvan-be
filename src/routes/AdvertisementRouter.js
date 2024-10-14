const express = require('express')
const AdvertisementController = require('../controllers/AdvertisementController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.AdvertisementAccuracy, upload.single("image"), AdvertisementController.addAdvertisement);
router.put('/update/:id', middlewares.AdvertisementAccuracy, upload.single("image"), AdvertisementController.updateAdvertisement);
router.patch('/status/:id', middlewares.AdvertisementAccuracy, AdvertisementController.statusAdvertisement);
router.get('/all', AdvertisementController.allAdvertisement);
router.get('/detail/:id', AdvertisementController.detailAdvertisement);
router.get('/list', AdvertisementController.listAdvertisement);
router.delete('/delete/:id', middlewares.AdvertisementAccuracy, AdvertisementController.deleteAdvertisement);

module.exports = router