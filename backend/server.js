const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('cookie-session');

const authRoutes = require('./routes/auth');
const docRoutes = require('./routes/documents');
const wiRoutes = require('./routes/workinstructions');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(session({
  name: 'session',
  keys: ['secretKey123'],
  maxAge: 24 * 60 * 60 * 1000
}));

// APIルート
app.use('/api', authRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/workinstructions', wiRoutes);

// フロントエンド成果物
app.use(express.static(path.join(__dirname, '../dist')));

// publicフォルダ
app.use('/pdf', express.static(path.join(__dirname, '../public/pdf')));
app.use('/temp', express.static(path.join(__dirname, '../public/temp')));

// Reactルーター対応
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
