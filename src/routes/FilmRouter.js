const express = require('express')
const filmController = require('../controllers/FilmController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.filmAccuracy, upload.single("image"), filmController.addFilm);
router.get('/image/:name', filmController.getImage)
router.put('/update/:id', middlewares.filmAccuracy, upload.single("image"), filmController.updateFilm);
router.get('/:id', filmController.detailFilm);
router.get('/', filmController.allFilm);
router.patch('/status/:id', middlewares.filmAccuracy, filmController.statusFilm);

module.exports = router