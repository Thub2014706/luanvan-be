const express = require('express')
const roomController = require('../controllers/RoomController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.theaterAccuracy, roomController.addRoom);
router.put('/update/:id', middlewares.theaterAccuracy, roomController.updateRoom);
router.get('/detail/:id', roomController.detailRoom);
router.get('/', roomController.allRoom);
router.patch('/status/:id', middlewares.theaterAccuracy, roomController.statusRoom);
router.patch('/delete/:id', middlewares.theaterAccuracy, roomController.deleteRoom);

module.exports = router