const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, login } = require('./helper');

describe('Bug 4: PATCH /api/candidates/:id - role gating for ADMIN role', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('allows ADMIN to update candidate status with HTTP 200', async () => {
    const auth = await login(server.baseUrl, 'admin', 'admin123');
    assert.strictEqual(auth.role, 'ADMIN');
    const cookie = auth.res.headers.get('set-cookie') || '';
    const sid = cookie.split(';')[0];

    const res = await fetch(`${server.baseUrl}/api/candidates/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
        Cookie: sid
      },
      body: JSON.stringify({ status: 'VERIFIED' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.candidate.status, 'VERIFIED');
  });
});
