const express = require('express')
const directorController = require('../controllers/DirectorController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', upload.single("avatar"), directorController.addDirector);
router.put('/:id', upload.single("avatar"), directorController.updateDirector);
router.get('/detail/:id', directorController.detailDirector);
router.get('/', directorController.allDirector);
router.delete('/:id', directorController.deleteDirector);
router.get('/list', directorController.listDirector);

module.exports = router