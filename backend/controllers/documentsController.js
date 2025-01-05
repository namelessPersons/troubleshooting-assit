const externalApiService = require('../services/externalApiService');
const fs = require('fs');
const path = require('path');

exports.askDocument = async (req, res) => {
    try {
      // req.body: { Query, DocumentNumber, Source, DocumentType, Language }
      const result = await externalApiService.queryDocument(req.body);
  
      // result = { openAiAnswer, pages } をフロントへ返却
      return res.json({
        openAiAnswer: result.openAiAnswer,
        pages: result.pages
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || 'Failed to get answer' });
    }
  };

// Model/Serialによる検索
exports.search = (req, res) => {
  const { model, serial } = req.query;
  const documents = require('../data/documents.json');

  // 厳密一致 & "start-end" の範囲チェック
  const matched = documents.filter(doc => {
    if (doc.targetModel !== model){
        console.log('Modeltype not matched')
        return false;
    } 
    const [start, end] = doc.targetSerialRange.split('-').map(n => parseInt(n, 10));
    const s = parseInt(serial, 10);
    console.log('serial: ',serial)
    return (s >= start && s <= end);
  });
  return res.json(matched);
};
