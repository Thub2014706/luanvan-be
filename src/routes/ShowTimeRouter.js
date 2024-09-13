const express = require('express')
const showTimeController = require('../controllers/ShowTimeController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.showTimeAccuracy, showTimeController.addShowTime);
router.get('/', showTimeController.allShowTime);
router.get('/detail-by-id/:id', showTimeController.detailShowTimeById);
router.get('/all-by-room', showTimeController.detailShowTimeByRoom);
router.get('/list-by-day', showTimeController.listShowTimeByDay);
router.get('/check-seat', showTimeController.soldOutSeat);
router.get('/list-by-theater', showTimeController.showTimeByTheater);
router.get('/film-by-theater', showTimeController.listFilmByTheater);

module.exports = router