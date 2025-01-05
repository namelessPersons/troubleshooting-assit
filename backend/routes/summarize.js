// backend/routes/summarize.js
const express = require('express');
const router = express.Router();
const externalApiService = require('../services/externalApiService');

router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const summary = await externalApiService.summarizeText(text);
    return res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Summarize failed' });
  }
});

module.exports = router;
