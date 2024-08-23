const express = require('express')
const showTimeController = require('../controllers/ShowTimeController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.showTimeAccuracy, showTimeController.addShowTime);
router.get('/', showTimeController.allShowTime);

module.exports = router