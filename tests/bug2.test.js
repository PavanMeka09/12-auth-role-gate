const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helper');

describe('Bug 2: GET /api/candidates/:id - unauthenticated access', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('rejects candidate retrieval without authorization header', async () => {
    const res = await fetch(`${server.baseUrl}/api/candidates/1`);
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Unauthorized');
  });

  it('rejects candidate retrieval with an invalid token', async () => {
    const res = await fetch(`${server.baseUrl}/api/candidates/1`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.error, 'Unauthorized');
  });
});
