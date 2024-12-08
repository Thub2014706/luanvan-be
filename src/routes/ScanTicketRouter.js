const express = require('express')
const scanTicketController = require('../controllers/ScanTicketController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

// router.post('/', middlewares.scanTiketAccuracy, scanTicketController.addScanTicket);
// router.get('/test/:id', middlewares.scanTiketAccuracy, scanTicketController.testScanTicket);
router.post('/', scanTicketController.addScanTicket);
router.get('/test/:id', scanTicketController.testScanTicket);


module.exports = router