const express = require('express')
const pointHistoryController = require('../controllers/PointHistoryController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.get('/get-all/:id', pointHistoryController.allPointHistory);
// router.get('/detail', popupController.detailPopup);
// router.delete('/delete', middlewares.popupAccuracy, popupController.deletePopup);

module.exports = router