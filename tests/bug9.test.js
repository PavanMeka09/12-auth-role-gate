const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDomEnvironment } = require('./helper');

describe('Bug 9: UI - candidate Delete button visibility for AGENT role', () => {
  it('does not render Delete button for AGENT role', () => {
    const { elements, context } = createDomEnvironment();
    const candidates = [
      { id: 1, name: 'Asha Rao', email: 'asha.rao@example.com', status: 'IN_PROGRESS' }
    ];

    context.renderCandidates(candidates, 'AGENT');

    const tbody = elements['candidates-table-tbody'];
    assert.strictEqual(tbody.children.length, 1);
    const row = tbody.children[0];
    const hasDeleteBtn = row.innerHTML.includes('delete-btn');

    assert.strictEqual(
      hasDeleteBtn,
      false,
      'Expected Delete button not to be rendered for AGENT role'
    );
  });
});
