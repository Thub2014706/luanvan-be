const express = require('express')
const commentController = require('../controllers/CommentController')
const middlewares = require('../controllers/MiddlewareController');
const router = express.Router()

router.post('/', commentController.addComment);
router.get('/detail/:id', commentController.detailComment);
router.get('/all-by-film/:id', commentController.listCommentByFilm);
router.get('/avg-comment/:id', commentController.avgComment);

module.exports = router