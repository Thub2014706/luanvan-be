const express = require('express')
const ticketRefundController = require('../controllers/TicketRefundController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', ticketRefundController.addTicketRefund);
router.get('/:id', ticketRefundController.allTicketRefund);
router.get('/refund-by-order/:id', ticketRefundController.ticketRefundByOrder);

module.exports = router