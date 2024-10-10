const express = require('express')
const statisticalController = require('../controllers/StatisticalController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.get('/daily-revenue', statisticalController.dailyRevenue);
router.get('/total-ticket', statisticalController.totalTicket);
router.get('/total-revenue', statisticalController.totalRevenue);
router.get('/new-user', statisticalController.newUser);
router.get('/seven-day-revenue-ticket', statisticalController.sDayRevenueTicket);
router.get('/seven-day-revenue-combo', statisticalController.sDayRevenueCombo);
router.get('/seven-day-ticket', statisticalController.sDayTicket);
router.get('/seven-day-combo', statisticalController.sDayCombo);
router.get('/film-revenue', statisticalController.filmRevenue);
router.get('/theater-revenue', statisticalController.theaterRevenue);

module.exports = router