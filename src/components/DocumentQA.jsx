import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askDocument } from '../../src/services/api';

function handleAutoScroll(e, containerRef) {
  if (!containerRef.current) return;
  const container = containerRef.current;
  const rect = container.getBoundingClientRect();
  const mouseY = e.clientY;
  const topThreshold = rect.top + 50;
  const bottomThreshold = rect.bottom - 50;
  const scrollSpeed = 5;

  if (mouseY < topThreshold) {
    container.scrollTop -= scrollSpeed;
  } else if (mouseY > bottomThreshold) {
    container.scrollTop += scrollSpeed;
  }
}

export default function DocumentQA({ currentDocNumber }) {
  const [question, setQuestion] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [pages, setPages] = useState([]);
  const containerRef = useRef(null);

  const handleAsk = async () => {
    const res = await askDocument({
      Query: question,
      DocumentNumber: currentDocNumber,
      Source: 'Document Center',
      DocumentType: 'Shop Manual',
      Language: 'English'
    });
    if (res && res.openAiAnswer) {
      const splitted = res.openAiAnswer.split(/\n\s*\n/);
      setParagraphs(splitted);
      setPages(res.pages || []);
    }
  };

  const handleDragStartAnswer = (e, content) => {
    // GPT要約の「title」 は後で WorkInstruction側で summarizeText() する場合もある
    // ここでは originalText に 'content' を入れ、 sourceType='ANSWER'
    const payload = {
      text: content,
      sourceType: 'ANSWER'
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragStartPage = (e, content) => {
    // Referenced Page
    const payload = {
      text: content,
      sourceType: 'PAGE'
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragStart = (e, content) => {
    // originalText = content
    const payload = { text: content };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    handleAutoScroll(e, containerRef);
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px'
      }}
      onDragOver={handleDragOver}
    >
      <textarea
        rows={3}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask question here..."
        style={{ width: '100%', marginBottom: '8px' ,flexShrink: 0 }}
      />
      <button onClick={handleAsk} style={{ marginBottom: '8px' }}>Ask</button>

      <h4>Answer (Markdown rendered):</h4>
      {paragraphs.map((para, i) => (
        <div
          key={i}
          draggable
          onDragStart={(e) => handleDragStartAnswer(e, para)}
          style={{ border: '1px solid #ccc', margin: '4px 0', padding: '4px' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {para}
          </ReactMarkdown>
        </div>
      ))}

      <h4>Referenced Pages:</h4>
      {pages.map((pg, i) => {
        const content = `[${pg.page}] ${pg.heading}`;
        return (
          <div
            key={i}
            draggable
            onDragStart={(e) => handleDragStartPage(e, content)}
            style={{ border: '1px solid #ccc', margin: '4px 0', padding: '4px' }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
