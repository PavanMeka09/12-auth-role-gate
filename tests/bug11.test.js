const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, login } = require('./helper');

describe('Bug 11: GET /api/users - leaks plaintext password field', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(() => {
    server.stop();
  });

  it('does not leak plaintext password field in returned user records', async () => {
    const auth = await login(server.baseUrl, 'admin', 'admin123');
    assert.strictEqual(auth.role, 'ADMIN');
    const cookie = auth.res.headers.get('set-cookie') || '';
    const sid = cookie.split(';')[0];

    const res = await fetch(`${server.baseUrl}/api/users`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Cookie: sid
      }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(body.users));
    assert.ok(body.users.length > 0);

    for (const user of body.users) {
      assert.strictEqual(
        'password' in user,
        false,
        `Expected user ${user.username} not to leak password field`
      );
    }
  });
});
