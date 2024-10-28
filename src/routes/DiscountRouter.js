const express = require('express')
const discountController = require('../controllers/DiscountController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.discountAccuracy, discountController.addDiscount);
router.put('/update/:id', middlewares.discountAccuracy, discountController.updateDiscount);
router.get('/detail/:id', discountController.detailDiscount);
router.get('/', discountController.allDiscount);
// router.patch('/status/:id', middlewares.discountAccuracy, discountController.statusDiscount);
router.patch('/:id', middlewares.discountAccuracy, discountController.deleteDiscount);
router.get('/list', discountController.listDiscount);
router.get('/list-future', discountController.listDiscountFuture);

module.exports = router