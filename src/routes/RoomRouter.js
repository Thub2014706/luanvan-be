const express = require('express')
const roomController = require('../controllers/RoomController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

// router.post('/', middlewares.theaterAccuracy, roomController.addRoom);
// router.put('/update/:id', middlewares.theaterAccuracy, roomController.updateRoom);
// router.get('/detail/:id', roomController.detailRoom);
// router.get('/', roomController.allRoom);
// router.patch('/status/:id', middlewares.theaterAccuracy, roomController.statusRoom);
// router.patch('/delete/:id', middlewares.theaterAccuracy, roomController.deleteRoom);
// router.get('/list-by-theater/:id', roomController.listRoomByTheater);
// router.get('/filter-by-theater', roomController.filterRoomByTheater);

router.post('/', roomController.addRoom);
router.put('/update/:id', roomController.updateRoom);
router.get('/detail/:id', roomController.detailRoom);
router.get('/', roomController.allRoom);
router.patch('/status/:id', roomController.statusRoom);
router.patch('/delete/:id', roomController.deleteRoom);
router.get('/list-by-theater/:id', roomController.listRoomByTheater);
router.get('/filter-by-theater', roomController.filterRoomByTheater);

module.exports = router