const express = require('express')
const comboController = require('../controllers/ComboController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', upload.single("image"), comboController.addCombo);
router.put('/update/:id', upload.single("image"), comboController.updateCombo);
router.get('/detail/:id', comboController.detailCombo);
router.get('/', comboController.allCombo);
router.patch('/status/:id', comboController.statusCombo);
router.delete('/:id', comboController.deleteCombo);

module.exports = router