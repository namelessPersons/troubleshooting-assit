import React, { useState } from 'react';

/**
 * シンプルなモーダルコンポーネント。
 * - isOpen: 開いているかどうか
 * - originalText: 元の回答文
 * - onSave: 引数(editedText) -> 保存コールバック
 * - onCancel: キャンセル
 */
export default function ModalEditOriginal({
  isOpen,
  originalText,
  onSave,
  onCancel
}) {
  const [tempText, setTempText] = useState(originalText || '');

  if (!isOpen) return null;

  const handleOk = () => {
    onSave(tempText);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Edit Original Text</h3>
        <textarea
          rows={8}
          style={{ width: '100%' }}
          value={tempText}
          onChange={e => setTempText(e.target.value)}
        />
        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <button onClick={handleOk} style={{ marginRight: '8px' }}>OK</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
