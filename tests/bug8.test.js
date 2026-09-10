const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDomEnvironment } = require('./helper');

describe('Bug 8: UI - Manage Users button visibility for ADMIN', () => {
  it('displays "Manage Users" button when logged in with role ADMIN', () => {
    const { elements } = createDomEnvironment({
      initialStorage: {
        token: 'admin-token',
        role: 'ADMIN',
        username: 'admin'
      }
    });

    const manageUsersBtn = elements['manage-users-btn'];
    assert.strictEqual(
      manageUsersBtn.classList.contains('hidden'),
      false,
      'Expected #manage-users-btn to be visible (not have "hidden" class) for ADMIN role'
    );
  });
});
