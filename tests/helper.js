const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close((err) => {
        if (err) return reject(err);
        resolve(port);
      });
    });
  });
}

async function startServer() {
  const port = await getFreePort();
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    proc.stdout.on('data', (d) => {
      if (!started && d.toString().includes('auth-role-gate listening on')) {
        started = true;
        resolve({
          port,
          baseUrl: `http://localhost:${port}`,
          stop: () => {
            try {
              proc.kill();
            } catch (e) {}
          }
        });
      }
    });

    proc.on('error', (err) => {
      if (!started) reject(err);
    });

    proc.on('exit', (code) => {
      if (!started) reject(new Error(`Server exited early with code ${code}`));
    });
  });
}

async function login(baseUrl, username, password) {
  const res = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const body = await res.json();
  return { res, body, token: body.token, role: body.role };
}

function createDomEnvironment({ initialStorage = {}, mockFetch = null } = {}) {
  function createClassList(initial = []) {
    const classes = new Set(initial);
    return {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      toggle: (c, force) => {
        if (force === undefined) force = !classes.has(c);
        if (force) classes.add(c);
        else classes.delete(c);
        return force;
      },
      contains: (c) => classes.has(c),
      toString: () => Array.from(classes).join(' ')
    };
  }

  class Element {
    constructor(tag, id = '', initialClasses = []) {
      this.tagName = tag.toUpperCase();
      this.id = id;
      this.classList = createClassList(initialClasses);
      this.children = [];
      this._listeners = {};
      this.value = '';
      this.textContent = '';
      this.dataset = {};
      this._innerHTML = '';
    }
    get innerHTML() {
      return this._innerHTML;
    }
    set innerHTML(val) {
      this._innerHTML = val;
    }
    addEventListener(evt, fn) {
      if (!this._listeners[evt]) this._listeners[evt] = [];
      this._listeners[evt].push(fn);
    }
    dispatchEvent(evt) {
      const list = this._listeners[evt.type] || [];
      for (const fn of list) fn(evt);
    }
    click() {
      this.dispatchEvent({ type: 'click', target: this, defaultPrevented: false, preventDefault() {} });
    }
    appendChild(child) {
      this.children.push(child);
      return child;
    }
    querySelector(sel) {
      if (sel === '.delete-btn') {
        return this.innerHTML.includes('delete-btn') ? new Element('button', '', ['delete-btn']) : null;
      }
      if (sel === '.edit-btn') {
        return this.innerHTML.includes('edit-btn') ? new Element('button', '', ['edit-btn']) : null;
      }
      return null;
    }
  }

  const elements = {
    'login-panel': new Element('section', 'login-panel'),
    dashboard: new Element('section', 'dashboard', ['hidden']),
    'users-panel': new Element('section', 'users-panel', ['hidden']),
    who: new Element('div', 'who', ['hidden']),
    'who-text': new Element('span', 'who-text'),
    'login-btn': new Element('button', 'login-btn'),
    'login-error': new Element('div', 'login-error', ['hidden']),
    'logout-btn': new Element('button', 'logout-btn'),
    'manage-users-btn': new Element('button', 'manage-users-btn', ['hidden']),
    'add-toggle-btn': new Element('button', 'add-toggle-btn', ['hidden']),
    'add-form': new Element('div', 'add-form', ['hidden']),
    'create-btn': new Element('button', 'create-btn'),
    toast: new Element('div', 'toast', ['hidden']),
    username: new Element('input', 'username'),
    password: new Element('input', 'password'),
    'new-name': new Element('input', 'new-name'),
    'new-email': new Element('input', 'new-email'),
    'reset-btn': new Element('button', 'reset-btn'),
    'candidates-table-tbody': new Element('tbody'),
    'users-table-tbody': new Element('tbody')
  };

  const storage = { ...initialStorage };
  const localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
    setItem: (k, v) => {
      storage[k] = String(v);
    },
    removeItem: (k) => {
      delete storage[k];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    }
  };

  const document = {
    getElementById: (id) => elements[id] || null,
    querySelector: (sel) => {
      if (sel === '#candidates-table tbody') return elements['candidates-table-tbody'];
      if (sel === '#users-table tbody') return elements['users-table-tbody'];
      return null;
    },
    createElement: (tag) => new Element(tag),
    body: new Element('body')
  };

  const appJsCode = fs.readFileSync(path.resolve(__dirname, '../public/app.js'), 'utf8');
  const context = {
    document,
    localStorage,
    sessionStorage: localStorage,
    setTimeout: () => {},
    fetch: mockFetch || (() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
    location: { reload: () => {} },
    console
  };
  vm.createContext(context);
  vm.runInContext(appJsCode, context);

  return { elements, localStorage, context };
}

module.exports = {
  startServer,
  login,
  createDomEnvironment
};
