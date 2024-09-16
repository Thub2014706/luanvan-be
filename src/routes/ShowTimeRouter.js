const express = require('express')
const showTimeController = require('../controllers/ShowTimeController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.showTimeAccuracy, showTimeController.addShowTime);
router.get('/', showTimeController.allShowTime);
router.get('/detail-by-id/:id', showTimeController.detailShowTimeById);
router.get('/all-by-room', showTimeController.detailShowTimeByRoom);
router.get('/list-by-day', showTimeController.listShowTimeByDay);
router.get('/list-by-film', showTimeController.listShowTimeByFilm);
router.get('/check-seat', showTimeController.soldOutSeat);
router.get('/list-by-theater', showTimeController.showTimeByTheater);
router.get('/film-by-theater', showTimeController.listFilmByTheater);
router.get('/date-by-film', showTimeController.listDateByFilm);
router.get('/filter', showTimeController.showTimeFilter);

module.exports = router