const express = require('express')
const ticketRefundController = require('../controllers/TicketRefundController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', ticketRefundController.addTicketRefund);
router.get('/:id', ticketRefundController.allTicketRefund);

module.exports = router