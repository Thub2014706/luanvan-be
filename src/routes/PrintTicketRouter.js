const express = require('express')
const printTicketController = require('../controllers/PrintTicketController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

// router.post('/', middlewares.printAccuracy, printTicketController.addPrintTicket);
// router.get('/test/:id', middlewares.printAccuracy, printTicketController.testPrintTicket);

router.post('/', printTicketController.addPrintTicket);
router.get('/test/:id', printTicketController.testPrintTicket);

module.exports = router