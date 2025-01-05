const PDFDocument = require('pdfkit');

/**
 * A4縦向き・ページまたぎ対応 + ヘッダー再表示サンプル
 */
exports.generateWorkInstructionPDF_stream = async (workInstruction, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margins: { top: 40, bottom: 40, left: 40, right: 40 }
  });
  doc.pipe(res);

  // [1] pageAddedイベントで、2ページ目以降もヘッダーを再描画する
  doc.on('pageAdded', () => {
    drawHeader(doc, workInstruction);
  });

  // [2] 1ページ目のヘッダーを描画
  drawHeader(doc, workInstruction);

  // OriginalTextを後でまとめて出力
  const originalTextList = [];

  // [3] Job描画
  if (Array.isArray(workInstruction.jobs)) {
    workInstruction.jobs.forEach((job, jobIndex) => {
      drawJobSection(doc, job, jobIndex, originalTextList);
      doc.moveDown(1);
    });
  }

  // [4] Original Texts
  if (originalTextList.length > 0) {
    drawOriginalTextsSection(doc, originalTextList);
  }

  // [5] 終了
  doc.end();
};

/** =============================
    ヘッダー再描画
    ============================= */
function drawHeader(doc, wi) {
  const startX = doc.page.margins.left;
  const startY = doc.y;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const headerHeight = 60;

  // 枠線
  doc.lineWidth(1)
    .rect(startX, startY, pageWidth, headerHeight)
    .stroke();

  // 中央タイトル
  doc.fontSize(14)
    .text('Work Instruction', startX, startY + 5, {
      width: pageWidth,
      align: 'center'
    });

  // Title(左) / Date+Assignment(右)
  doc.fontSize(10)
    .text(`Title: ${wi.title || ''}`, startX + 5, startY + 25, {
      width: pageWidth / 2 - 10,
      align: 'left'
    });

  doc.text(
    `Date: ${wi.date || ''}    Assignment: ${wi.assignment || ''}`,
    startX + pageWidth / 2,
    startY + 25,
    {
      width: pageWidth / 2 - 5,
      align: 'right'
    }
  );

  // ヘッダー領域を確保
  doc.y = startY + headerHeight + 10;
  doc.x = doc.page.margins.left;
}

/** =============================
    Jobセクション
    ============================= */
function drawJobSection(doc, job, jobIndex, originalTextList) {
  doc.fontSize(12).fillColor('#000');
  doc.x = doc.page.margins.left;

  // ページ下部チェック (とりあえず 40px程度必要と仮定)
  ensureSpace(doc, 40);

  doc.text(`Job ${jobIndex + 1}: ${job.jobName || ''}`, { underline: false, bold: true });
  doc.moveDown(0.5);

  // テーブルヘッダ
  drawTableHeader(doc, [
    { label: 'No.', width: 40 },
    { label: 'Title', width: 200 },
    { label: 'Category', width: 120 },
    { label: 'Src', width: 50 }
  ]);

  // アイテム
  if (Array.isArray(job.items)) {
    job.items.forEach((item, iIndex) => {
      const rowNo = `${jobIndex + 1}-${iIndex + 1}`;

      // 1行目
      drawTableRow(doc, [
        { text: rowNo, width: 40 },
        { text: item.title || '', width: 200 },
        { text: item.category || '', width: 120 },
        { text: item.sourceType || '', width: 50 }
      ]);

      // 2行目 (Comment)
      drawCommentRow(doc, `Comment: ${item.comment || ''}`, 410);

      // Original Text
      if (item.originalText && item.originalText.trim() !== '') {
        originalTextList.push({
          no: rowNo,
          text: item.originalText
        });
      }
    });
  }
}

/** =============================
    OriginalTextsセクション
    ============================= */
function drawOriginalTextsSection(doc, originalTextList) {
  doc.fontSize(12).fillColor('#000');
  doc.x = doc.page.margins.left;

  ensureSpace(doc, 30); // タイトル文分の高さ確保
  doc.text('Original Texts:', { underline: false, bold: true });
  doc.moveDown(0.5);

  drawTableHeader(doc, [
    { label: 'No.', width: 50 },
    { label: 'OriginalText', width: 360 }
  ]);

  originalTextList.forEach(obj => {
    drawTableRow(doc, [
      { text: obj.no, width: 50 },
      { text: obj.text, width: 360 }
    ]);
  });
}

/** =============================
    テーブル描画系ユーティリティ
    ============================= */

/** テーブルヘッダ */
function drawTableHeader(doc, columns) {
  // ページ下部チェック
  ensureSpace(doc, 20);

  const startX = doc.x;
  const startY = doc.y;
  const rowHeight = 20;
  const totalWidth = sumWidths(columns);

  doc.save()
    .fillColor('#e0e0e0')
    .rect(startX, startY, totalWidth, rowHeight)
    .fill()
    .restore();

  let currentX = startX;
  columns.forEach(col => {
    doc.fillColor('#000')
      .fontSize(10)
      .text(col.label, currentX + 5, startY + 5, {
        width: col.width - 10,
        align: 'left'
      });
    currentX += col.width;
  });

  drawBoxLines(doc, startX, startY, columns, rowHeight);
  doc.y = startY + rowHeight;
  doc.x = startX;
}

/** 1行 (No./Title/Category/Srcなど) */
function drawTableRow(doc, columns) {
  // まず行の高さを計算
  const rowHeight = calculateRowHeight(doc, columns);

  // ページ下部チェック
  ensureSpace(doc, rowHeight);

  const startX = doc.x;
  const startY = doc.y;
  const totalWidth = sumWidths(columns);

  doc.save()
    .fillColor('#fff')
    .rect(startX, startY, totalWidth, rowHeight)
    .fill()
    .restore();

  let currentX = startX;
  columns.forEach(col => {
    doc.fillColor('#000')
      .fontSize(10)
      .text(col.text || '', currentX + 5, startY + 5, {
        width: col.width - 10,
        align: 'left'
      });
    currentX += col.width;
  });

  drawBoxLines(doc, startX, startY, columns, rowHeight);
  doc.y = startY + rowHeight;
  doc.x = startX;
}

/** Comment用1行 */
function drawCommentRow(doc, comment, totalWidth) {
  const rowHeight = calculateRowHeight(doc, [{ text: comment, width: totalWidth }]);
  ensureSpace(doc, rowHeight);

  const startX = doc.x;
  const startY = doc.y;

  doc.save()
    .fillColor('#f9f9f9')
    .rect(startX, startY, totalWidth, rowHeight)
    .fill()
    .restore();

  doc.fillColor('#000')
    .fontSize(10)
    .text(comment, startX + 5, startY + 5, {
      width: totalWidth - 10,
      align: 'left'
    });

  drawBoxLines(doc, startX, startY, [{ text: '', width: totalWidth }], rowHeight);
  doc.y = startY + rowHeight;
  doc.x = startX;
}

/** 枠線（上下左右+縦線） */
function drawBoxLines(doc, startX, startY, columns, rowHeight) {
  doc.save().lineWidth(1).strokeColor('#000');
  const totalWidth = sumWidths(columns);

  // 上線
  doc.moveTo(startX, startY)
    .lineTo(startX + totalWidth, startY)
    .stroke();
  // 下線
  doc.moveTo(startX, startY + rowHeight)
    .lineTo(startX + totalWidth, startY + rowHeight)
    .stroke();

  // 左線 & 縦線
  let currentX = startX;
  columns.forEach(col => {
    doc.moveTo(currentX, startY)
      .lineTo(currentX, startY + rowHeight)
      .stroke();
    currentX += col.width;
  });
  // 右端
  doc.moveTo(currentX, startY)
    .lineTo(currentX, startY + rowHeight)
    .stroke();

  doc.restore();
}

/** ページ下部までの残り高さをチェックして、足りなければ addPage() */
function ensureSpace(doc, neededHeight) {
  const bottomY = doc.page.height - doc.page.margins.bottom;
  if (doc.y + neededHeight > bottomY) {
    doc.addPage(); // → on('pageAdded') で drawHeader() 呼び出し
  }
}

/** カラム幅の合計 */
function sumWidths(columns) {
  return columns.reduce((acc, col) => acc + (col.width || 0), 0);
}

/** テキスト折り返し高さを計算 */
function calculateRowHeight(doc, columns) {
  let maxHeight = 20; // 最低行高
  columns.forEach(col => {
    const text = col.text || '';
    const h = doc.heightOfString(text, {
      width: (col.width || 100) - 10,
      align: 'left'
    }) + 10; // 上下余白
    if (h > maxHeight) maxHeight = h;
  });
  return maxHeight;
}
