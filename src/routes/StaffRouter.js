const express = require('express')
const staffController = require('../controllers/StaffController')
const middlewares = require('../controllers/MiddlewareController')
const authController = require('../controllers/AuthController')
const upload = require('./Upload')
const router = express.Router()

router.post('/create', middlewares.staffAccuracy, upload.single("avatar"), staffController.createStaff);
router.post('/signin', authController.loginStaff);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', middlewares.userAccuracy, authController.logout);
router.get('/', staffController.allStaff);
router.patch('/status/:id', middlewares.staffAccuracy, staffController.statusStaff);
router.get('/detail/:id', staffController.detailStaff);
router.patch('/delete/:id', middlewares.staffAccuracy, staffController.deleteStaff);
router.patch('/access/:id', middlewares.staffAccuracy, staffController.accessStaff);

module.exports = router