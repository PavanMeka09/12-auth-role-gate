const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, login } = require('./helper');

describe('Bug 3: POST /api/candidates - role gating for VIEWER role', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('rejects candidate creation for VIEWER role with 403 Forbidden', async () => {
    const auth = await login(server.baseUrl, 'viewer', 'viewer123');
    assert.strictEqual(auth.role, 'VIEWER');
    const cookie = auth.res.headers.get('set-cookie') || '';
    const sid = cookie.split(';')[0];

    const res = await fetch(`${server.baseUrl}/api/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
        Cookie: sid
      },
      body: JSON.stringify({ name: 'Unauthorized Candidate', email: 'viewer.candidate@example.com' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'Forbidden');
  });
});
