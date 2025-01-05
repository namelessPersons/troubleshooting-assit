// backend/routes/summarize.js
const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarizeController');

router.post('/',summarizeController.summarize)

module.exports = router;