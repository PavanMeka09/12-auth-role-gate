const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helper');

describe('Bug 1: POST /api/login - missing required password field', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('rejects login when password is an empty string', async () => {
    const res = await fetch(`${server.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Invalid credentials');
  });

  it('rejects login when password is missing from payload', async () => {
    const res = await fetch(`${server.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Invalid credentials');
  });
});
