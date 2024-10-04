const express = require('express')
const orderTicketController = require('../controllers/OrderTicketController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', orderTicketController.addOrderTicket);
router.get('/detail', orderTicketController.detailOrderTicket);
router.get('/all-selled', orderTicketController.allOrderTicketSelled);
router.get('/', orderTicketController.allOrderTicket);
// router.delete('/:id', middlewares.performerAccuracy, performerController.deletePerformer);
router.get('/sum-by-user/:id', orderTicketController.sumPayByUser);
router.get('/order-by-user/:id', orderTicketController.allOrderByUser);

module.exports = router