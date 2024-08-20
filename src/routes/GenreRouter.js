const express = require('express')
const genreController = require('../controllers/GenreController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/', middlewares.genreAccuracy, genreController.addGenre);
router.put('/:id', middlewares.genreAccuracy, genreController.updateGenre);
router.delete('/:id', middlewares.genreAccuracy, genreController.deleteGenre);
router.get('/detail/:id', genreController.detailGenre);
router.get('/', genreController.allGenre);
router.get('/list', genreController.listGenre)

module.exports = router