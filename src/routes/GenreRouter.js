const express = require('express')
const genreController = require('../controllers/GenreController')
const middlewares = require('../controllers/MiddlewareController')
const router = express.Router()

router.post('/', genreController.addGenre);
router.put('/:id', genreController.updateGenre);
router.delete('/:id', genreController.deleteGenre);
router.get('/detail/:id', genreController.detailGenre);
router.get('/', genreController.allGenre);
router.put('/status/:id', genreController.statusGenre);
router.get('/list', genreController.listGenre)

module.exports = router