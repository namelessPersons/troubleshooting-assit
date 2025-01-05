const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');

// Q&A
router.post('/qa', documentsController.askDocument);

// 検索
router.get('/search', documentsController.search);

module.exports = router;
