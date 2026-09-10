const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDomEnvironment } = require('./helper');

describe('Bug 7: UI - missing error feedback on failed login', () => {
  it('displays #login-error element when login request fails', async () => {
    const mockFetch = () =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

    const { elements } = createDomEnvironment({ mockFetch });
    const usernameInput = elements['username'];
    const passwordInput = elements['password'];
    const loginBtn = elements['login-btn'];
    const loginError = elements['login-error'];

    usernameInput.value = 'invalid-user';
    passwordInput.value = 'wrong-password';

    loginBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.strictEqual(
      loginError.classList.contains('hidden'),
      false,
      'Expected #login-error not to have "hidden" class on failed login'
    );
    assert.ok(
      loginError.textContent.length > 0,
      'Expected #login-error to contain error message text'
    );
  });
});
