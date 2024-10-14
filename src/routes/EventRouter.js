const express = require('express')
const EventController = require('../controllers/EventController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.EventAccuracy, upload.single("image"), EventController.addEvent);
router.put('/update/:id', middlewares.EventAccuracy, upload.single("image"), EventController.updateEvent);
router.patch('/status/:id', middlewares.EventAccuracy, EventController.statusEvent);
router.get('/all', EventController.allEvent);
router.get('/detail/:id', EventController.detailEvent);
router.get('/list', EventController.listEvent);
router.delete('/delete/:id', middlewares.EventAccuracy, EventController.deleteEvent);

module.exports = router