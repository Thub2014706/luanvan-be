const express = require('express')
const orderComboController = require('../controllers/OrderComboController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', orderComboController.addOrderCombo);
// router.put('/:id', middlewares.performerAccuracy,  performerController.updatePerformer);
router.get('/detail', orderComboController.detailOrderCombo);
router.get('/order-by-user/:id', orderComboController.allOrderByUser);
// router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
// router.get('/list', performerController.listPerfomer);

module.exports = router