const express = require('express')
const informationController = require('../controllers/InformationController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

// router.put('/', middlewares.InformationAccuracy, upload.single("image"), informationController.addInfomation);
router.put('/', upload.single("image"), informationController.addInfomation);
router.get('/detail', informationController.detailInfomation);

module.exports = router