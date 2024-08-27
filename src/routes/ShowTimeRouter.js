const express = require('express')
const showTimeController = require('../controllers/ShowTimeController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.showTimeAccuracy, showTimeController.addShowTime);
router.get('/', showTimeController.allShowTime);
router.get('/all-by-room', showTimeController.detailShowTimeByRoom);
router.get('/list-by-day', showTimeController.listShowTimeByDay);

module.exports = router