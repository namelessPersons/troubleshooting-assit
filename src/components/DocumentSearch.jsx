import React, { useState } from 'react';
import { searchDocuments } from '../services/api';

export default function DocumentSearch({ onSelectDocument }) {
  const [modelType, setModelType] = useState('');
  const [serial, setSerial] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const list = await searchDocuments(modelType, serial);
    setResults(list);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '10px' }}>
      <h4>Search Documents</h4>
      <div>
        <label>Model type: </label>
        <input 
          value={modelType} 
          onChange={e => setModelType(e.target.value)} 
        />
      </div>
      <div>
        <label>Serial: </label>
        <input 
          value={serial} 
          onChange={e => setSerial(e.target.value)} 
        />
      </div>
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map(doc => (
          <li key={doc.docNumber}>
            {doc.docNumber} - {doc.title}{' '}
            <button onClick={() => onSelectDocument(doc.docNumber)}>
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
