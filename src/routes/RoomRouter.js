const express = require('express')
const roomController = require('../controllers/RoomController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', roomController.addRoom);
router.put('/update/:id', roomController.updateRoom);
router.get('/detail/:id', roomController.detailRoom);
router.get('/', roomController.allRoom);
router.patch('/status/:id', roomController.statusRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router