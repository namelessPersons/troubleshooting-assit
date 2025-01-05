<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { saveWorkInstruction, generatePdf } from '../../src/services/api';
import { summarizeText } from '../../backend/services/externalApiService';

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
=======
// src/components/WorkInstructionEdit.jsx
import React, { useState, useEffect, useRef } from 'react';
import { saveWorkInstruction, summarizeText } from '../services/api';
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78

export default function WorkInstructionEdit({ instruction, onUpdate }) {
  const [localWI, setLocalWI] = useState(instruction);
  const containerRef = useRef(null);
<<<<<<< HEAD

  // For pop-up modal editing (only for ANSWER items)
  const [editingItem, setEditingItem] = useState(null); // { jobIndex, itemIndex, textValue }
=======
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // 編集対象アイテム
  const [tempOriginalText, setTempOriginalText] = useState(''); // モーダル上のテキスト
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78

  useEffect(() => {
    setLocalWI(instruction);
  }, [instruction]);

<<<<<<< HEAD
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
        const summary = await summarizeText(dropped.text);
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

=======
  // -----------------------------
  //  Save / Export PDF
  // -----------------------------
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
  const handleSave = async () => {
    const res = await saveWorkInstruction(localWI);
    if (res.success) {
      alert('Saved!');
<<<<<<< HEAD
      onUpdate && onUpdate(localWI);
=======
      onUpdate?.(localWI);
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
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

<<<<<<< HEAD
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
=======
  // -----------------------------
  //  Jobの操作 (Add/Delete/Update)
  // -----------------------------
  const handleAddJob = () => {
    const newId = Date.now();
    const newJob = {
      id: newId,
      jobName: `New Job ${newId}`,
      items: []
    };
    setLocalWI(prev => ({
      ...prev,
      jobs: [...(prev.jobs || []), newJob]
    }));
  };

  const handleDeleteJob = (jobIndex) => {
    if (!window.confirm('Delete this job?')) return;
    const updatedJobs = [...(localWI.jobs || [])];
    updatedJobs.splice(jobIndex, 1);
    setLocalWI(prev => ({
      ...prev,
      jobs: updatedJobs
    }));
  };

  const handleJobNameChange = (jobIndex, newName) => {
    const updatedJobs = [...(localWI.jobs || [])];
    updatedJobs[jobIndex] = { 
      ...updatedJobs[jobIndex],
      jobName: newName
    };
    setLocalWI(prev => ({
      ...prev,
      jobs: updatedJobs
    }));
  };

  // -----------------------------
  //  Itemの削除/編集のみ (Addはドラッグ&ドロップで)
  // -----------------------------
  const handleDeleteItem = (jobIndex, itemIndex) => {
    if (!window.confirm('Delete this item?')) return;
    const updatedJobs = [...(localWI.jobs || [])];
    const targetJob = { ...updatedJobs[jobIndex] };
    targetJob.items = targetJob.items.filter((_, i) => i !== itemIndex);
    updatedJobs[jobIndex] = targetJob;
    setLocalWI(prev => ({ ...prev, jobs: updatedJobs }));
  };

  const handleItemFieldChange = (jobIndex, itemIndex, field, newValue) => {
    const updatedJobs = [...(localWI.jobs || [])];
    const targetJob = { ...updatedJobs[jobIndex] };
    const items = [...targetJob.items];
    items[itemIndex] = {
      ...items[itemIndex],
      [field]: newValue
    };
    targetJob.items = items;
    updatedJobs[jobIndex] = targetJob;
    setLocalWI(prev => ({ ...prev, jobs: updatedJobs }));
  };


  // -----------------------------
  //  タイトルクリック → モーダル (sourceType==="ANSWER" のみ)
  // -----------------------------
  const handleTitleClick = (jobIndex, itemIndex) => {
    const theItem = localWI.jobs[jobIndex].items[itemIndex];
    if (theItem.sourceType !== 'ANSWER') {
      // "PAGE"の場合などは編集不可
      return;
    }
    // モーダルを表示 → OriginalTextを編集用にコピー
    setEditingItem({ jobIndex, itemIndex });
    setTempOriginalText(theItem.originalText || '');
    setShowModal(true);
  };

  // -----------------------------
  //  モーダルのOK → OriginalText更新
  // -----------------------------
  const handleModalOk = () => {
    const { jobIndex, itemIndex } = editingItem;
    handleItemFieldChange(jobIndex, itemIndex, 'originalText', tempOriginalText);
    setShowModal(false);
    setEditingItem(null);
  };

  // -----------------------------
  //  モーダルのCancel → 破棄
  // -----------------------------
  const handleModalCancel = () => {
    setShowModal(false);
    setEditingItem(null);
    setTempOriginalText('');
  };


  const handleItemChange = (jobIndex, itemIndex, field, newValue) => {
    const updatedJobs = [...(localWI.jobs || [])];
    const targetJob = { ...updatedJobs[jobIndex] };
    const newItems = [...targetJob.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [field]: newValue
    };
    targetJob.items = newItems;
    updatedJobs[jobIndex] = targetJob;
    setLocalWI(prev => ({
      ...prev,
      jobs: updatedJobs
    }));
  };

  // -----------------------------
  //  ドラッグ＆ドロップ: summarize → アイテム追加
  // -----------------------------
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) return;
      const data = JSON.parse(jsonData);
      const { text, sourceType } = data;

      // Summarize
      const res = await summarizeText(text);
      if (!res.success) {
        alert('Summarize failed');
        return;
      }

      const summarizedTitle = res.summary || '';

      // 新Itemを作成
      const newItem = {
        id: Date.now(),
        title: summarizedTitle,  // 要約結果をタイトルに
        originalText: text,      // フルテキスト
        sourceType: sourceType || '',
        category: '',
        comment: ''
      };

      // 例: 先頭のJob(0番目)に追加 (必要に応じて変更)
      const jobIndex = 0;
      if (!localWI.jobs || !localWI.jobs[jobIndex]) {
        alert('No job found to add the item.');
        return;
      }

      const updatedJobs = [...localWI.jobs];
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        items: [...updatedJobs[jobIndex].items, newItem]
      };

      const updatedWI = { ...localWI, jobs: updatedJobs };
      setLocalWI(updatedWI);
      onUpdate?.(updatedWI);

    } catch (err) {
      console.error(err);
      alert('Error in onDrop: ' + err.message);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h4>Work Instruction Edit</h4>

      {/* (WorkInstruction全体情報) */}
      <div>
        <label>Title: </label>
        <input
          value={localWI.title}
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
          onChange={e => setLocalWI({ ...localWI, title: e.target.value })}
        />
      </div>
      <div>
        <label>Date: </label>
        <input
<<<<<<< HEAD
          type="date"
          value={localWI.date || ''}
=======
          value={localWI.date}
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
          onChange={e => setLocalWI({ ...localWI, date: e.target.value })}
        />
      </div>
      <div>
        <label>Assignment: </label>
        <input
<<<<<<< HEAD
          value={localWI.assignment || ''}
=======
          value={localWI.assignment}
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
          onChange={e => setLocalWI({ ...localWI, assignment: e.target.value })}
        />
      </div>

      <hr />

<<<<<<< HEAD
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
=======
      {/* Job一覧 & Item一覧 (例) */}
      {localWI.jobs?.map((job, jIndex) => (
        <div key={job.id || jIndex} style={{ border: '1px solid #ccc', margin: '8px 0', padding: '8px' }}>
          <div>
            <strong>Job Name:</strong>{' '}
            <input
              value={job.jobName}
              onChange={e => {
                // handleJobNameChange など
                const updatedJobs = [...localWI.jobs];
                updatedJobs[jIndex] = { ...job, jobName: e.target.value };
                setLocalWI(prev => ({ ...prev, jobs: updatedJobs }));
              }}
            />
          </div>

          {/* Items */}
          <div style={{ marginTop: '8px', marginLeft: '16px' }}>
            {job.items?.map((item, iIndex) => (
              <div
                key={item.id || iIndex}
                style={{ border: '1px solid #aaa', margin: '4px 0', padding: '4px' }}
              >
                {/* タイトル表示 */}
                <div style={{ cursor: item.sourceType === 'ANSWER' ? 'pointer' : 'default' }}>
                  <label>Title: </label>
                  <span
                    onClick={() => handleTitleClick(jIndex, iIndex)}
                    style={{ textDecoration: (item.sourceType === 'ANSWER') ? 'underline' : 'none' }}
                  >
                    {item.title}
                  </span>
                  {' '}
                  (type: {item.sourceType})
                </div>

                <div>
                  <label>Category: </label>
                  <select
                    value={item.category || ''}
                    onChange={e => handleItemFieldChange(jIndex, iIndex, 'category', e.target.value)}
                  >
                    <option value="">(Select)</option>
                    <option value="Troubleshooting">Troubleshooting</option>
                    <option value="Repair procedure">Repair procedure</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
                <div>
                  <label>Comment: </label>
                  <input
                    value={item.comment || ''}
                    onChange={e => handleItemFieldChange(jIndex, iIndex, 'comment', e.target.value)}
                  />
                </div>
                <div style={{ marginTop: '4px' }}>
                  <button onClick={() => handleDeleteItem(jIndex, iIndex)}>Delete Item</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <hr />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={handlePdf}>Export PDF</button>
      </div>

      {/* ★ モーダル表示 */}
      {showModal && (
        <ModalWindow
          originalText={tempOriginalText}
          onChange={txt => setTempOriginalText(txt)}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        />
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
      )}
    </div>
  );
}
<<<<<<< HEAD
=======

/**
 * シンプルなモーダルコンポーネント
 * originalTextをテキストエリアで編集 → OK or Cancel
 */
function ModalWindow({ originalText, onChange, onOk, onCancel }) {
  // 簡易的なオーバーレイスタイル
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  };

  const modalStyle = {
    backgroundColor: '#fff',
    padding: '16px',
    width: '400px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h4>Edit Original Text</h4>
        <textarea
          rows={8}
          style={{ width: '100%' }}
          value={originalText}
          onChange={e => onChange(e.target.value)}
        />
        <div style={{ marginTop: '8px', textAlign: 'right' }}>
          <button onClick={onCancel} style={{ marginRight: '8px' }}>Cancel</button>
          <button onClick={onOk}>OK</button>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
