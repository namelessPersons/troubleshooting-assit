import React, { useState, useEffect, useRef } from 'react';
import { saveWorkInstruction, generatePdf,summarize } from '../../src/services/api';

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

export default function WorkInstructionEdit({ instruction, onUpdate }) {
  const [localWI, setLocalWI] = useState(instruction);
  const containerRef = useRef(null);

  // For pop-up modal editing (only for ANSWER items)
  const [editingItem, setEditingItem] = useState(null); // { jobIndex, itemIndex, textValue }

  useEffect(() => {
    setLocalWI(instruction);
  }, [instruction]);

  const addNewJob = () => {
    const newWI = { ...localWI };
    newWI.jobs = newWI.jobs || [];
    newWI.jobs.push({
      id: Date.now(),
      jobName: '',
      items: []
    });
    setLocalWI(newWI);
  };

  const handleDeleteJob = (jobIndex) => {
    if (!window.confirm('Delete this job?')) return;
    const newWI = { ...localWI };
    newWI.jobs.splice(jobIndex, 1);
    setLocalWI(newWI);
  };

  const handleDeleteItem = (jobIndex, itemIndex) => {
    if (!window.confirm('Delete this item?')) return;
    const newWI = { ...localWI };
    newWI.jobs[jobIndex].items.splice(itemIndex, 1);
    setLocalWI(newWI);
  };

  const updateJobField = (jobIndex, key, value) => {
    const newWI = { ...localWI };
    newWI.jobs[jobIndex][key] = value;
    setLocalWI(newWI);
  };

  const updateItem = (jobIndex, itemIndex, key, value) => {
    const newWI = { ...localWI };
    newWI.jobs[jobIndex].items[itemIndex][key] = value;
    setLocalWI(newWI);
  };

  const moveItem = (jobIndex, itemIndex, direction) => {
    const newWI = { ...localWI };
    const items = newWI.jobs[jobIndex].items;
    const targetIndex = (direction === 'up') ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];
    setLocalWI(newWI);
  };

  // ドロップ → GPT要約 or そのまま
  const handleDrop = async (jobIndex, e) => {
    e.preventDefault();
    const jsonData = e.dataTransfer.getData('application/json');
    if (!jsonData) return;
    const dropped = JSON.parse(jsonData); 
    // { text, sourceType: 'ANSWER'|'PAGE' }

    try {
      const newWI = { ...localWI };
      const job = newWI.jobs[jobIndex];
      if (!job.items) job.items = [];

      if (dropped.sourceType === 'ANSWER') {
        // Summarize
        const response = await summarize({ text: dropped.text });
        const { summary } =response;
      
        job.items.push({
          id: `item-${Date.now()}`,
          title: summary,
          originalText: dropped.text,
          sourceType: 'ANSWER',
          category: '',
          comment: ''
        });
      } else {
        // PAGE
        job.items.push({
          id: `item-${Date.now()}`,
          title: dropped.text,
          originalText: '',
          sourceType: 'PAGE',
          category: '',
          comment: ''
        });
      }

      setLocalWI(newWI);
    } catch (err) {
      console.error('Drop/Summarize failed', err);
      window.alert('Failed to add item.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    handleAutoScroll(e, containerRef);
  };

  const handleSave = async () => {
    const res = await saveWorkInstruction(localWI);
    if (res.success) {
      alert('Saved!');
      onUpdate && onUpdate(localWI);
    } else {
      alert('Save failed');
    }
  };

  const handlePdf = () => {
    if (!localWI.id) {
      alert('WorkInstruction does not have ID yet.');
      return;
    }
    // PDFダウンロード
    window.location.href = `/api/workinstructions/${localWI.id}/pdf`;
  };

  // Itemクリック → if ANSWER, open modal for editing originalText
  const handleItemClick = (jobIndex, itemIndex) => {
    const item = localWI.jobs[jobIndex].items[itemIndex];
    if (item.sourceType !== 'ANSWER') {
      return; // PAGEは編集不可
    }
    setEditingItem({
      jobIndex,
      itemIndex,
      textValue: item.originalText
    });
  };

  const handleModalSave = () => {
    if (!editingItem) return;
    const { jobIndex, itemIndex, textValue } = editingItem;

    const newWI = { ...localWI };
    newWI.jobs[jobIndex].items[itemIndex].originalText = textValue;
    setLocalWI(newWI);

    setEditingItem(null);
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
      onDrop={(e) => e.preventDefault()}
    >
      <h4>Work Instruction Edit</h4>
      <div>
        <label>Title: </label>
        <input
          value={localWI.title || ''}
          onChange={e => setLocalWI({ ...localWI, title: e.target.value })}
        />
      </div>
      <div>
        <label>Date: </label>
        <input
          type="date"
          value={localWI.date || ''}
          onChange={e => setLocalWI({ ...localWI, date: e.target.value })}
        />
      </div>
      <div>
        <label>Assignment: </label>
        <input
          value={localWI.assignment || ''}
          onChange={e => setLocalWI({ ...localWI, assignment: e.target.value })}
        />
      </div>

      <hr />

      {localWI.jobs && localWI.jobs.map((job, jIndex) => (
        <div
          key={job.id}
          style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}
          onDrop={(e) => handleDrop(jIndex, e)}
          onDragOver={(e) => e.preventDefault()}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>Job #{jIndex + 1}</h5>
            <button style={{ marginLeft: 'auto' }} onClick={() => handleDeleteJob(jIndex)}>
              Delete Job
            </button>
          </div>
          <div style={{ marginTop: '6px' }}>
            <label>Job name: </label>
            <input
              value={job.jobName || ''}
              onChange={e => updateJobField(jIndex, 'jobName', e.target.value)}
            />
          </div>

          {job.items && job.items.map((item, iIndex) => (
            <div key={item.id} style={{ marginLeft: '20px', marginBottom: '12px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}
                onClick={() => handleItemClick(jIndex, iIndex)}
              >
                <button onClick={(e) => { e.stopPropagation(); moveItem(jIndex, iIndex, 'up'); }}>↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveItem(jIndex, iIndex, 'down'); }}>↓</button>
                <span style={{ marginLeft: '8px', flex: 1 }}>
                  {item.title}
                  {item.sourceType === 'ANSWER' && ' (Answer)'}
                  {item.sourceType === 'PAGE' && ' (Page)'}
                </span>
                <button
                  style={{ marginLeft: '8px' }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(jIndex, iIndex); }}
                >
                  Delete Item
                </button>
              </div>
              <div style={{ marginBottom: '4px' }}>
                <label>Category: </label>
                <select
                  value={item.category || ''}
                  onChange={e => updateItem(jIndex, iIndex, 'category', e.target.value)}
                >
                  <option value="">(Select)</option>
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="Repair procedure">Repair procedure</option>
                  <option value="QA Info">QA Info</option>
                </select>
              </div>
              <div>
                <label>Comment: </label><br />
                <textarea
                  rows={2}
                  style={{ width: '100%' }}
                  value={item.comment || ''}
                  onChange={e => updateItem(jIndex, iIndex, 'comment', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}

      <button onClick={addNewJob}>+Add New Job</button>
      <hr />
      <button onClick={handleSave}>Save</button>
      <button onClick={handlePdf}>Export PDF</button>

      {editingItem && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              width: '400px', backgroundColor: '#fff', padding: '16px',
              margin: '100px auto', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Original Text</h3>
            <textarea
              rows={6}
              style={{ width: '100%' }}
              value={editingItem.textValue}
              onChange={(e) => setEditingItem({ ...editingItem, textValue: e.target.value })}
            />
            <div style={{ marginTop: '8px', textAlign: 'right' }}>
              <button onClick={() => setEditingItem(null)} style={{ marginRight: '8px' }}>
                Cancel
              </button>
              <button onClick={handleModalSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
