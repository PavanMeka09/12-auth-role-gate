const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, login } = require('./helper');

describe('Bug 5: DELETE /api/candidates/:id - role gating enforces ADMIN only', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('rejects candidate deletion by AGENT role with 403 Forbidden', async () => {
    const auth = await login(server.baseUrl, 'agent', 'agent123');
    assert.strictEqual(auth.role, 'AGENT');
    const cookie = auth.res.headers.get('set-cookie') || '';
    const sid = cookie.split(';')[0];

    const res = await fetch(`${server.baseUrl}/api/candidates/1`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Cookie: sid
      }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.error, 'Forbidden');
  });
});
