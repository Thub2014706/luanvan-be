const express = require('express')
const scheduleController = require('../controllers/ScheduleController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

// router.post('/', middlewares.scheduleAccuracy, scheduleController.addSchedule);
// router.get('/', scheduleController.allSchedule);
// router.get('/detail/:id', scheduleController.detailSchedule);
// router.put('/update/:id', middlewares.scheduleAccuracy, scheduleController.updateSchedule);
// router.get('/list', scheduleController.listSchedule);
// router.get('/list-schedule-not-screened', scheduleController.listScheduleNotEd);
// router.patch('/delete-schedule/:id', middlewares.scheduleAccuracy, scheduleController.deleteSchedule);

router.post('/', scheduleController.addSchedule);
router.get('/', scheduleController.allSchedule);
router.get('/detail/:id', scheduleController.detailSchedule);
router.put('/update/:id', scheduleController.updateSchedule);
router.get('/list', scheduleController.listSchedule);
router.get('/list-schedule-not-screened', scheduleController.listScheduleNotEd);
router.patch('/delete-schedule/:id',scheduleController.deleteSchedule);

module.exports = router