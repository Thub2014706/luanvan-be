const express = require('express')
const NewsController = require('../controllers/NewsController')
const middlewares = require('../controllers/MiddlewareController');
const upload = require('./Upload');
const router = express.Router()

// router.post('/', middlewares.NewsAccuracy, upload.single("image"), NewsController.addNews);
// router.put('/update/:id', middlewares.NewsAccuracy, upload.single("image"), NewsController.updateNews);
// router.patch('/status/:id', middlewares.NewsAccuracy, NewsController.statusNews);
// router.get('/all', NewsController.allNews);
// router.get('/detail/:id', NewsController.detailNews);
// router.get('/list', NewsController.listNews);
// router.delete('/delete/:id', middlewares.NewsAccuracy, NewsController.deleteNews);

router.post('/', upload.single("image"), NewsController.addNews);
router.put('/update/:id', upload.single("image"), NewsController.updateNews);
router.patch('/status/:id', NewsController.statusNews);
router.get('/all', NewsController.allNews);
router.get('/detail/:id', NewsController.detailNews);
router.get('/list', NewsController.listNews);
router.delete('/delete/:id', NewsController.deleteNews);

module.exports = router