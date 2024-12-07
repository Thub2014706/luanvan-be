const express = require('express')
const directorController = require('../controllers/DirectorController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.directorAccuracy, upload.single("avatar"), directorController.addDirector);
router.put('/:id', middlewares.directorAccuracy, upload.single("avatar"), directorController.updateDirector);
router.get('/detail/:id', directorController.detailDirector);
router.get('/', directorController.allDirector);
router.delete('/:id', middlewares.directorAccuracy, directorController.deleteDirector);
router.get('/list', directorController.listDirector);
router.patch('/status/:id', middlewares.directorAccuracy, directorController.statusDirector);

module.exports = router