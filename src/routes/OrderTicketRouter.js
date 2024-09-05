const express = require('express')
const orderTicketController = require('../controllers/OrderTicketController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.orderTicketAccuracy, orderTicketController.addOrderTicket);
// router.put('/:id', middlewares.performerAccuracy,  performerController.updatePerformer);
router.get('/detail', orderTicketController.detailOrderTicket);
// router.get('/', performerController.allPerformer);
// router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
// router.get('/list', performerController.listPerfomer);

module.exports = router