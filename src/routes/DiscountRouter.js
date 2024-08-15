const express = require('express')
const discountController = require('../controllers/DiscountController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', discountController.addDiscount);
router.put('/update/:id', discountController.updateDiscount);
router.get('/detail/:id', discountController.detailDiscount);
router.get('/', discountController.allDiscount);
router.patch('/status/:id', discountController.statusDiscount);
router.delete('/:id', discountController.deleteDiscount);
router.get('/list', discountController.listDiscount);

module.exports = router