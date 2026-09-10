const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helper');

describe('Bug 12: POST /api/login - substring password matching', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('rejects authentication when password is an incomplete substring', async () => {
    const res = await fetch(`${server.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Invalid credentials');
  });
});
