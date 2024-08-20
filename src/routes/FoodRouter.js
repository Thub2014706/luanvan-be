const express = require('express')
const foodController = require('../controllers/FoodController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', middlewares.foodAccuracy, upload.single("image"), foodController.addFood);
router.put('/update/:id', middlewares.foodAccuracy, upload.single("image"), foodController.updateFood);
router.get('/detail/:id', foodController.detailFood);
router.get('/', foodController.allFood);
router.patch('/status/:id', middlewares.foodAccuracy, foodController.statusFood);
router.delete('/:id', middlewares.foodAccuracy, foodController.deleteFood);
router.get('/list', foodController.listFood);

module.exports = router