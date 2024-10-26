const express = require('express')
const comboController = require('../controllers/ComboController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.comboAccuracy, upload.single("image"), comboController.addCombo);
router.put('/update/:id', middlewares.comboAccuracy, upload.single("image"), comboController.updateCombo);
router.get('/detail/:id', comboController.detailCombo);
router.get('/', comboController.allCombo);
// router.patch('/status/:id', middlewares.comboAccuracy, comboController.statusCombo);
router.patch('/:id', middlewares.comboAccuracy, comboController.deleteCombo);
router.get('/list', comboController.listCombo);

module.exports = router