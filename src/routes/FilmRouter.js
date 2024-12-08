const express = require('express')
const filmController = require('../controllers/FilmController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

// router.post('/', middlewares.filmAccuracy, upload.single("image"), filmController.addFilm);
// router.get('/image/:name', filmController.getImage)
// router.put('/update/:id', middlewares.filmAccuracy, upload.single("image"), filmController.updateFilm);
// router.get('/detail/:id', filmController.detailFilm);
// router.get('/detail-by-schedule/:id', filmController.detailFilmBySchedule);
// router.get('/', filmController.allFilm);
// router.patch('/status/:id', middlewares.filmAccuracy, filmController.statusFilm);
// router.get('/list', filmController.listFilm);
// router.get('/list-by-schedule', filmController.listFilmBySchedule);
// router.get('/list-by-theater', filmController.listFilmByTheater);
// router.get('/search', filmController.searchFilm);
// router.get('/filter', filmController.filterFilm);
// router.get('/number-ticket/:id', filmController.numberTicketFilm);

router.post('/', upload.single("image"), filmController.addFilm);
router.get('/image/:name', filmController.getImage)
router.put('/update/:id', upload.single("image"), filmController.updateFilm);
router.get('/detail/:id', filmController.detailFilm);
router.get('/detail-by-schedule/:id', filmController.detailFilmBySchedule);
router.get('/', filmController.allFilm);
router.patch('/status/:id', filmController.statusFilm);
router.get('/list', filmController.listFilm);
router.get('/list-by-schedule', filmController.listFilmBySchedule);
router.get('/list-by-theater', filmController.listFilmByTheater);
router.get('/search', filmController.searchFilm);
router.get('/filter', filmController.filterFilm);
router.get('/number-ticket/:id', filmController.numberTicketFilm);

module.exports = router