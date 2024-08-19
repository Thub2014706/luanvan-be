const express = require('express')
const staffController = require('../controllers/StaffController')
const middlewares = require('../controllers/MiddlewareController')
const authController = require('../controllers/AuthController')
const upload = require('./Upload')
const router = express.Router()

router.post('/create', upload.single("avatar"), staffController.createStaff);
router.post('/signin', authController.loginStaff);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', middlewares.userAccuracy, authController.logout);
router.get('/', staffController.allStaff);
router.patch('/status/:id', staffController.statusStaff);
router.get('/detail/:id', staffController.detailStaff);
router.patch('/delete/:id', staffController.deleteStaff);
router.patch('/access/:id', staffController.accessStaff);

module.exports = router