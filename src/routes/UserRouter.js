const express = require('express')
const userController = require('../controllers/UserController')
const middlewares = require('../controllers/MiddlewareController')
const authController = require('../controllers/AuthController')
const router = express.Router()

router.post('/signup', userController.register);
router.post('/signin', authController.loginUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', middlewares.userAccuracy, authController.logout);
router.get('/', userController.allUser);
router.patch('/status/:id', middlewares.userAdminAccuracy, userController.statusUser);
router.get('/detail-by-phone', userController.detailUserByPhone);

module.exports = router