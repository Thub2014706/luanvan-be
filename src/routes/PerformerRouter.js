const express = require('express')
const performerController = require('../controllers/PerformerController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.performerAccuracy, upload.single("avatar"), performerController.addPerformer);
router.put('/:id', middlewares.performerAccuracy, upload.single("avatar"), performerController.updatePerformer);
router.get('/detail/:id', performerController.detailPerformer);
router.get('/', performerController.allPerformer);
router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
router.get('/list', performerController.listPerfomer);

module.exports = router