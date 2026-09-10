const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, login } = require('./helper');

describe('Bug 6: GET /api/users - wrong status code on access denial', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('returns HTTP status 403 Forbidden when non-admin accesses GET /api/users', async () => {
    const auth = await login(server.baseUrl, 'agent', 'agent123');
    assert.strictEqual(auth.role, 'AGENT');
    const cookie = auth.res.headers.get('set-cookie') || '';
    const sid = cookie.split(';')[0];

    const res = await fetch(`${server.baseUrl}/api/users`, {
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
