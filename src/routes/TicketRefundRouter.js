const express = require('express')
const ticketRefundController = require('../controllers/TicketRefundController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', ticketRefundController.addTicketRefund);
router.get('/refund-by-user/:id', ticketRefundController.allTicketRefund);
router.get('/refund-by-order/:id', ticketRefundController.ticketRefundByOrder);
router.get('/all-refund', ticketRefundController.allOrderTicketRefund);
router.get('/export', ticketRefundController.exportReport);

module.exports = router