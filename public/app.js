const loginPanel = document.getElementById('login-panel');
const dashboard = document.getElementById('dashboard');
const usersPanel = document.getElementById('users-panel');
const whoEl = document.getElementById('who');
const whoText = document.getElementById('who-text');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const manageUsersBtn = document.getElementById('manage-users-btn');
const addToggleBtn = document.getElementById('add-toggle-btn');
const addForm = document.getElementById('add-form');
const createBtn = document.getElementById('create-btn');
const candidatesBody = document.querySelector('#candidates-table tbody');
const usersBody = document.querySelector('#users-table tbody');
const toast = document.getElementById('toast');

function getSession() {
  return { token: localStorage.getItem('token'), role: localStorage.getItem('role') };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

async function authedFetch(url, options = {}) {
  const { token } = getSession();
  const headers = Object.assign({}, options.headers, {
    Authorization: `Bearer ${token}`
  });
  return fetch(url, Object.assign({}, options, { headers }));
}

function renderCandidates(candidates, role) {
  candidatesBody.innerHTML = '';
  candidates.forEach((c) => {
    const tr = document.createElement('tr');
    const canEdit = role === 'AGENT' || role === 'ADMIN';
    const canDelete = role === 'ADMIN' || role === 'AGENT';
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.status}</td>
      <td>
        ${canEdit ? `<button class="edit-btn secondary" data-id="${c.id}" data-status="${c.status}">Toggle Status</button>` : ''}
        ${canDelete ? `<button class="delete-btn danger" data-id="${c.id}">Delete</button>` : ''}
      </td>
    `;
    candidatesBody.appendChild(tr);
  });
}

async function loadCandidates() {
  const { role } = getSession();
  const res = await authedFetch('/api/candidates');
  const body = await res.json();
  renderCandidates(body.candidates || [], role);
}

async function loadUsers() {
  const res = await authedFetch('/api/users');
  const body = await res.json();
  usersBody.innerHTML = '';
  (body.users || []).forEach((u) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.role}</td>`;
    usersBody.appendChild(tr);
  });
}

function enterDashboard() {
  const { role } = getSession();
  loginPanel.classList.add('hidden');
  dashboard.classList.remove('hidden');
  whoEl.classList.remove('hidden');
  whoText.textContent = `Logged in as ${localStorage.getItem('username')} (${role})`;

  addToggleBtn.classList.toggle('hidden', role === 'VIEWER');
  manageUsersBtn.classList.toggle('hidden', role !== 'Admin');

  loadCandidates();
}

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const body = await res.json();
  if (!res.ok) {
    loginError.textContent = body.error || 'Invalid credentials';
    loginError.classList.remove('hidden');
    return;
  }
  loginError.classList.add('hidden');
  localStorage.setItem('token', body.token);
  localStorage.setItem('role', body.role);
  localStorage.setItem('username', username);
  enterDashboard();
});

logoutBtn.addEventListener('click', () => {
  loginPanel.classList.remove('hidden');
  dashboard.classList.add('hidden');
  usersPanel.classList.add('hidden');
  whoEl.classList.add('hidden');
});

addToggleBtn.addEventListener('click', () => {
  addForm.classList.toggle('hidden');
});

createBtn.addEventListener('click', async () => {
  const name = document.getElementById('new-name').value.trim();
  const email = document.getElementById('new-email').value.trim();
  const res = await authedFetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  if (res.ok) {
    document.getElementById('new-name').value = '';
    document.getElementById('new-email').value = '';
    addForm.classList.add('hidden');
    loadCandidates();
  }
  showToast('Candidate created successfully.');
});

manageUsersBtn.addEventListener('click', () => {
  usersPanel.classList.toggle('hidden');
  loadUsers();
});

candidatesBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    const res = await authedFetch(`/api/candidates/${id}`, { method: 'DELETE' });
    if (res.ok) loadCandidates();
    showToast(res.ok ? 'Candidate deleted.' : 'Delete failed.');
  }
  if (e.target.classList.contains('edit-btn')) {
    const id = e.target.dataset.id;
    const currentStatus = e.target.dataset.status;
    const nextStatus = currentStatus === 'VERIFIED' ? 'IN_PROGRESS' : 'VERIFIED';
    const res = await authedFetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    showToast('Candidate updated successfully.');
    loadCandidates();
  }
});

if (getSession().token) {
  enterDashboard();
}

// --- tooling: reset button (not part of the app under test) ---
(() => {
  const pending = sessionStorage.getItem('__toolingToast');
  if (pending) {
    sessionStorage.removeItem('__toolingToast');
    const t = document.createElement('div');
    t.className = 'tooling-toast';
    t.textContent = pending;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      await fetch('/api/reset', { method: 'POST' });
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      sessionStorage.setItem('__toolingToast', 'Data reset');
      location.reload();
    });
  }
})();
