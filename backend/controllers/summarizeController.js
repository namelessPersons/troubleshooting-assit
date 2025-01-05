const path = require('path');
const fs = require('fs');
const externalApiService = require('../services/externalApiService');

exports.summarize= async(req, res) => {
    try{
        const { text } = req.body;
        const summary = await externalApiService.summarizeText(text);
        return res.json({ success: true, summary });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Summarize failed' });
    }
};