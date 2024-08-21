const express = require('express')
const scheduleController = require('../controllers/ScheduleController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/', middlewares.scheduleAccuracy, scheduleController.addSchedule);
router.get('/', scheduleController.allSchedule);
router.put('/update/:id', middlewares.scheduleAccuracy, scheduleController.updateSchedule);

module.exports = router