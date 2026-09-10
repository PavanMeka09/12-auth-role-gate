const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDomEnvironment } = require('./helper');

describe('Bug 10: UI - logout session clearing from localStorage', () => {
  it('clears token, role, and username from localStorage upon logout', () => {
    const { elements, localStorage } = createDomEnvironment({
      initialStorage: {
        token: 'active-session-token',
        role: 'ADMIN',
        username: 'admin'
      }
    });

    const logoutBtn = elements['logout-btn'];
    logoutBtn.click();

    assert.strictEqual(
      localStorage.getItem('token'),
      null,
      'Expected token to be removed from localStorage upon logout'
    );
    assert.strictEqual(
      localStorage.getItem('role'),
      null,
      'Expected role to be removed from localStorage upon logout'
    );
    assert.strictEqual(
      localStorage.getItem('username'),
      null,
      'Expected username to be removed from localStorage upon logout'
    );
  });
});
