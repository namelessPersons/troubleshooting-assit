const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
<<<<<<< HEAD
=======
const PdfPrinter = require('pdfmake');
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../fonts/NotoSans-VariableFont_wdth,wght.ttf'),
    bold: path.join(__dirname, '../../fonts/NotoSans-VariableFont_wdth,wght.ttf'),
    italics: path.join(__dirname, '../../fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf'),
    bolditalics: path.join(__dirname, '../../fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf')
  }
};
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78


const wiFile = path.join(__dirname, '../data/workInstructions.json');

exports.list = (req, res) => {
  const userId = req.session.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  const userWIs = workInstructions.filter(w => w.userId === userId);
  res.json(userWIs);
};

exports.get = (req, res) => {
  const userId = req.session.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const id = parseInt(req.params.id, 10);
  const workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  const wi = workInstructions.find(w => w.id === id && w.userId === userId);
  if (!wi) return res.status(404).json({ error: 'Not found' });
  res.json(wi);
};

exports.create = (req, res) => {
  const userId = req.session.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  const newId = Math.max(0, ...workInstructions.map(w => w.id)) + 1;

  const newWI = {
    id: newId,
    userId,
    title: req.body.title || '',
    date: req.body.date || '',
    assignment: req.body.assignment || '',
    jobs: req.body.jobs || [] // array of { jobName, items: [{ text, category, comment }, ...] }
  };
  workInstructions.push(newWI);
  fs.writeFileSync(wiFile, JSON.stringify(workInstructions, null, 2));
  res.json({ success: true, id: newId });
};

exports.update = (req, res) => {
  const userId = req.session.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const id = parseInt(req.params.id, 10);
  let workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  const idx = workInstructions.findIndex(w => w.id === id && w.userId === userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Not found' });
  }

  workInstructions[idx] = {
    ...workInstructions[idx],
    title: req.body.title,
    date: req.body.date,
    assignment: req.body.assignment,
    jobs: req.body.jobs // 上書き
  };
  fs.writeFileSync(wiFile, JSON.stringify(workInstructions, null, 2));
  res.json({ success: true });
};

exports.remove = (req, res) => {
    const userId = req.session.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  
    const id = parseInt(req.params.id, 10);
    let workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  
    const idx = workInstructions.findIndex(w => w.id === id && w.userId === userId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Work instruction not found or not owned' });
    }
  
    // 物理的に削除
    workInstructions.splice(idx, 1);
    fs.writeFileSync(wiFile, JSON.stringify(workInstructions, null, 2));
    res.json({ success: true });
  };
<<<<<<< HEAD
  
=======
// backend/controllers/workInstructionController.js

>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
exports.exportPdf = async (req, res) => {
  const userId = req.session.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const id = parseInt(req.params.id, 10);
  const workInstructions = JSON.parse(fs.readFileSync(wiFile, 'utf-8'));
  const wi = workInstructions.find(w => w.id === id && w.userId === userId);
  if (!wi) return res.status(404).json({ error: 'Not found' });

  try {
    // 「ファイルをダウンロードさせたい」のでHTTPヘッダをセット
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="workInstruction_${id}.pdf"`);

    // pdfServiceからPDFDocumentを取得して直接resに流す
    const doc = await pdfService.generateWorkInstructionPDF_stream(wi, res);

    // docを終了
    //doc.end();

    // このままreturnしてOK (resにPDFが書き込まれる)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
