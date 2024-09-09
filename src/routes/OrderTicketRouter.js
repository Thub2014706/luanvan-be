const express = require('express')
const orderTicketController = require('../controllers/OrderTicketController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', middlewares.orderTicketAccuracy, orderTicketController.addOrderTicket);
router.get('/detail', orderTicketController.detailOrderTicket);
router.get('/all-selled', orderTicketController.allOrderTicketSelled);
router.get('/', orderTicketController.allOrderTicket);
// router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
// router.get('/list', performerController.listPerfomer);

module.exports = router