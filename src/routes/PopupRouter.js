const express = require('express')
const popupController = require('../controllers/PopupController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

// router.put('/', middlewares.popupAccuracy, upload.single("image"), popupController.addPopup);
// router.get('/detail', popupController.detailPopup);
// router.delete('/delete', middlewares.popupAccuracy, popupController.deletePopup);

router.put('/', upload.single("image"), popupController.addPopup);
router.get('/detail', popupController.detailPopup);
router.delete('/delete', popupController.deletePopup);

module.exports = router