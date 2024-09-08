const express = require('express')
const orderComboController = require('../controllers/OrderComboController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.orderComboAccuracy, orderComboController.addOrderCombo);
// router.put('/:id', middlewares.performerAccuracy,  performerController.updatePerformer);
router.get('/detail', orderComboController.detailOrderCombo);
// router.get('/all-selled', orderTicketController.allOrderTicketSelled);
// router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
// router.get('/list', performerController.listPerfomer);

module.exports = router