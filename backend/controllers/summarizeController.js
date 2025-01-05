const path = require('path');
const fs = require('fs');
const externalApiService = require('../services/externalApiService');

exports.summarize= async(req, res) => {
    try{
        const summary = await externalApiService.summarizeText(req);
        return res.json({ success: true, summary });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Summarize failed' });
    }
};