const express = require('express')
const genreController = require('../controllers/GenreController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/', middlewares.GenreAccuracy, genreController.addGenre);
router.put('/:id', middlewares.GenreAccuracy, genreController.updateGenre);
router.delete('/:id', middlewares.GenreAccuracy, genreController.deleteGenre);
router.get('/detail/:id', genreController.detailGenre);
router.get('/', genreController.allGenre);
router.put('/status/:id', middlewares.GenreAccuracy, genreController.statusGenre);
router.get('/list', genreController.listGenre)

module.exports = router