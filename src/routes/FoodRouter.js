const express = require('express')
const foodController = require('../controllers/FoodController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

router.post('/', upload.single("image"), foodController.addFood);
router.put('/update/:id', upload.single("image"), foodController.updateFood);
router.get('/detail/:id', foodController.detailFood);
router.get('/', foodController.allFood);
router.patch('/status/:id', foodController.statusFood);
router.delete('/:id', foodController.deleteFood);
router.get('/list', foodController.listFood);

module.exports = router