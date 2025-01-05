const API_BASE = '';

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  return res.json();
}

export async function askDocument(params) {
  const res = await fetch(`${API_BASE}/api/documents/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include'
  });
  return res.json();
}

export async function summarize(params) {
  const res = await fetch(`${API_BASE}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include'
  });
  return res.json();
}

export async function listWorkInstructions() {
  const res = await fetch(`${API_BASE}/api/workinstructions`, {
    method: 'GET',
    credentials: 'include'
  });
  return res.json();
}

export async function saveWorkInstruction(wi) {
  const method = wi.id ? 'PUT' : 'POST';
  const url = wi.id
    ? `${API_BASE}/api/workinstructions/${wi.id}`
    : `${API_BASE}/api/workinstructions`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wi),
    credentials: 'include'
  });
  return res.json();
}

export async function deleteWorkInstruction(workInstructionId) {
  const res = await fetch(`${API_BASE}/api/workinstructions/${workInstructionId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
}

export async function generatePdf(workInstructionId) {
  const res = await fetch(`${API_BASE}/api/workinstructions/${workInstructionId}/pdf`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

export async function searchDocuments(model, serial) {
  const res = await fetch(`${API_BASE}/api/documents/search?model=${model}&serial=${serial}`, {
    method: 'GET',
    credentials: 'include'
  });
  return res.json();
}
