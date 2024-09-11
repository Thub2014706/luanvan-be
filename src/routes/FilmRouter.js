const express = require('express')
const filmController = require('../controllers/FilmController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.filmAccuracy, upload.single("image"), filmController.addFilm);
router.get('/image/:name', filmController.getImage)
router.put('/update/:id', middlewares.filmAccuracy, upload.single("image"), filmController.updateFilm);
router.get('/detail/:id', filmController.detailFilm);
router.get('/', filmController.allFilm);
router.patch('/status/:id', middlewares.filmAccuracy, filmController.statusFilm);
router.get('/list', filmController.listFilm);
router.get('/list-film-not-screened', filmController.listFilmNotEd);
router.get('/list-by-schedule', filmController.listFilmBySchedule);

module.exports = router