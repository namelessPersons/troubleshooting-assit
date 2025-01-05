import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import DocumentSearch from './components/DocumentSearch';
import DocumentQA from './components/DocumentQA';
import WorkInstructionEdit from './components/WorkInstructionEdit';
<<<<<<< HEAD
=======

>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
import {
  listWorkInstructions,
  saveWorkInstruction,
  deleteWorkInstruction
} from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [workInstructions, setWorkInstructions] = useState([]);
  const [currentWI, setCurrentWI] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWorkInstructions();
    }
  }, [user]);

  const fetchWorkInstructions = async () => {
    const list = await listWorkInstructions();
    setWorkInstructions(list);
  };

  const handleNewWorkInstruction = async () => {
    const defaultTitle = `New WI (${new Date().toLocaleString()})`;
    const res = await saveWorkInstruction({
      title: defaultTitle,
      date: '',
      assignment: '',
      jobs: []
    });
    if (res.success && res.id) {
      const newWI = {
        id: res.id,
        title: defaultTitle,
        date: '',
        assignment: '',
        jobs: []
      };
      setWorkInstructions([...workInstructions, newWI]);
      setCurrentWI(newWI);
    }
  };

  const handleDeleteWorkInstruction = async (wiId) => {
    const sure = window.confirm('Are you sure you want to delete this instruction?');
    if (!sure) return;

    const res = await deleteWorkInstruction(wiId);
    if (res.success) {
      setWorkInstructions(prev => prev.filter(w => w.id !== wiId));
      if (currentWI && currentWI.id === wiId) {
        setCurrentWI(null);
      }
    } else {
      alert(res.error || 'Delete failed');
    }
  };

  if (!user) {
    return (
      <div style={{ margin: '20px' }}>
        <LoginForm onLoginSuccess={u => setUser(u)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 左サイドバー */}
      <div
        style={{
          width: '220px',
          borderRight: '1px solid #ccc',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <button onClick={handleNewWorkInstruction} style={{ margin: '8px' }}>
          New work instruction
        </button>
        <hr />
        {workInstructions.map(wi => (
          <div
            key={wi.id}
            style={{
              padding: '4px',
              backgroundColor: (currentWI && currentWI.id === wi.id) ? '#ddd' : 'transparent'
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setCurrentWI(wi)}
            >
              <span style={{ flex: 1 }}>{wi.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkInstruction(wi.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

<<<<<<< HEAD
      {/* 中央 QAエリア */}
=======
      {/* 中央エリア: Document Search & QA */}
>>>>>>> 0a3ece7dd8a18799220074b57f41336df0f05e78
      <div
        style={{
          flex: 1,
          borderRight: '1px solid #ccc',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DocumentSearch onSelectDocument={(docNumber) => setSelectedDoc(docNumber)} />
        {selectedDoc && <DocumentQA currentDocNumber={selectedDoc} />}
      </div>

      {/* 右サイドバー: WorkInstructionEdit */}
      <div
        style={{
          width: '400px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {currentWI ? (
          <WorkInstructionEdit
            instruction={currentWI}
            onUpdate={updated => {
              setCurrentWI(updated);
              setWorkInstructions(prev =>
                prev.map(w => w.id === updated.id ? updated : w)
              );
            }}
          />
        ) : (
          <div style={{ margin: '8px' }}>Select or create a Work Instruction</div>
        )}
      </div>
    </div>
  );
}
