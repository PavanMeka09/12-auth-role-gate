// Fake in-memory users — demo credentials only, not real secrets.
// makeSeed() returns a fresh clone for each student's store.
function makeSeed() {
  return {
    users: [
      { id: 1, username: 'admin', password: 'admin123', role: 'ADMIN' },
      { id: 2, username: 'agent', password: 'agent123', role: 'AGENT' },
      { id: 3, username: 'viewer', password: 'viewer123', role: 'VIEWER' }
    ],
    candidates: [
      { id: 1, name: 'Asha Rao', email: 'asha.rao@example.com', status: 'IN_PROGRESS' },
      { id: 2, name: 'Vikram Singh', email: 'vikram.singh@example.com', status: 'VERIFIED' }
    ],
    sessions: { 'guest-token': { username: 'guest', role: 'VIEWER', expiresAt: Infinity } }
  };
}

module.exports = { makeSeed };
