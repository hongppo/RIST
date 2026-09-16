/* Controller tests with DOM/clipboard doubles. Visual layout needs a browser. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const controller = fs.readFileSync(path.join(root, 'assets/code-export.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function setup({ clipboardFails = false, legacyCopy = true, descriptions = {} } = {}) {
  let document;
  class Node {
    constructor() {
      this.listeners = {};
      this.attributes = {};
      this.children = [];
      this.value = '';
      this.disabled = false;
      this.open = false;
      this.hidden = false;
      this.classes = new Set();
      this.classList = {
        contains: (name) => this.classes.has(name),
        add: (name) => this.classes.add(name),
        toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name),
        remove: (name) => this.classes.delete(name)
      };
    }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    async emit(name, event = {}) {
      for (const fn of this.listeners[name] || []) await fn(event);
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    closest() { return null; }
    removeAttribute(name) { delete this.attributes[name]; }
    toggleAttribute(name, value) { if (value) this.setAttribute(name, ''); else this.removeAttribute(name); }
    querySelector() { return this.label ||= new Node(); }
    querySelectorAll() { return []; }
    contains(node) { return this === node || this.children.some(child => child.contains(node)); }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    focus(options) { document.activeElement = this; this.focusOptions = options; }
    select() { this.selectionStart = 0; this.selectionEnd = this.value.length; }
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    getBoundingClientRect() { return { left: 20, top: 30, width: 640, height: 400, right: 660, bottom: 430 }; }
  }
  const nodes = Object.fromEntries([...shell.matchAll(/\bid="([^"]+)"/g)].map((m) => [m[1], new Node()]));
  const hostMessages = [];
  nodes['page-frame'].contentWindow = { postMessage(message) { hostMessages.push(message); } };
  nodes['page-frame'].clientWidth = 1280;
  nodes['page-frame'].clientHeight = 800;
  const window = new Node();
  const copied = [];
  let legacyCalls = 0;
  document = new Node();
  document.getElementById = (id) => { assert.ok(nodes[id], 'Known DOM ID: ' + id); return nodes[id]; };
  document.createElement = () => new Node();
  document.execCommand = (name) => { assert.equal(name, 'copy'); legacyCalls++; return legacyCopy; };
  const registry = {
    'pages/first.html': {
      html: '<!doctype html><html><head><style>.card{color:blue}</style></head><body><section data-component="card">첫 화면</section></body></html>',
      components: [{ id: 'card', title: '카드', html: '<div class="isolated"><section>첫 화면</section></div>', css: '.isolated section{color:blue}' }]
    },
    'pages/second.html': { html: '<html><body>두 번째</body></html>', components: [] }
  };
  window.MOCKUP_VIEWER_MANIFEST = { tree: [{ id: 'main-group', children: [
    { id: 'first-page', src: 'pages/first.html' },
    { id: 'nested-group', children: [{ id: 'second-page', src: 'pages/second.html' }] }
  ] }] };
  window.MOCKUP_VIEWER_SOURCES = registry;
  window.MOCKUP_VIEWER_DESCRIPTIONS = descriptions;
  window.MockupCanvasInput = function (surface, emit, options) {
    surface.canvasOptions = options;
    return { reset() {}, setSpace() {}, destroy() {} };
  };
  const navigator = { clipboard: { writeText: async (value) => { if (clipboardFails) throw new Error('Denied'); copied.push(value); } } };
  const context = vm.createContext({ window, document, navigator, Date, Math, Set, Object, String, Array, JSON, CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } } });
  window.dispatchEvent = (event) => window.emit(event.type, event);
  vm.runInContext(controller, context);
  const api = window.MockupCodeTools;
  let currentReady;
  let child;
  const childMessages = [];
  function preparePage(src = 'pages/first.html', { anchor = '', page = {} } = {}) {
    const ok = api.setPage({ id: src, src, title: src, ...page }, anchor);
    if (!ok) return false;
    const scripts = [...nodes['page-frame'].srcdoc.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1, 'One preview-only bridge');
    const childDoc = new Node();
    childDoc.head = new Node();
    childDoc.body = new Node();
    childDoc.documentElement = new Node();
    childDoc.createElement = () => new Node();
    const documentRoot = new Node();
    const policy = new Node();
    policy.textContent = '로그인 정책';
    policy.querySelector = () => null;
    policy.getBoundingClientRect = () => ({ top: 900 });
    documentRoot.append(policy);
    documentRoot.getBoundingClientRect = () => ({ bottom: 2200 });
    childDoc.querySelector = selector => selector === '[data-document-root]' ? documentRoot : null;
    const field = new Node();
    const scrollRegion = new Node();
    field.getBoundingClientRect = () => ({ top: 200, height: 40, left: 150, width: 100 });
    scrollRegion.getBoundingClientRect = () => ({ top: 100, bottom: 500, left: 100, right: 500 });
    field.closest = selector => selector === '[data-viewer-scroll-region]' ? scrollRegion : null;
    childDoc.getElementById = id => id === 'login-policy' ? policy : id === 'field' ? field : null;
    const parent = { postMessage(message) { childMessages.push(message); if (message.action === 'ready') currentReady = message; } };
    const childWindow = new Node();
    childWindow.scrollY = 12;
    childWindow.getSelection = () => ({ isCollapsed: true });
    vm.runInNewContext(scripts[0][1], { document: childDoc, window: childWindow, parent, Element: Node, Set, Object, requestAnimationFrame: fn => fn() });
    child = { documentRoot, policy, field, scrollRegion, doc: childDoc, window: childWindow, parent };
    return true;
  }
  function message(action, details = {}, source = nodes['page-frame'].contentWindow, ready = currentReady) {
    return window.emit('message', { source, data: { ...ready, ...details, action } });
  }
  return { nodes, window, api, registry, copied, preparePage, message, hostMessages, childMessages, child: () => child,
    childRequest: (data, from) => child.window.emit('message', { data, source: from === undefined ? child.parent : from }),
    ready: () => currentReady, legacyCalls: () => legacyCalls };
}

test('full page copy uses source without injected selection code', async () => {
  const s = setup();
  assert.equal(s.preparePage(), true);
  await s.message('ready');
  assert.equal(s.nodes['pick-component'].disabled, false);
  await s.nodes['open-code'].emit('click');
  assert.equal(s.nodes['code-content'].value, s.registry['pages/first.html'].html);
  assert.equal(s.nodes['code-dialog'].open, true);
  await s.nodes['copy-code'].emit('click');
  assert.deepEqual(s.copied, [s.registry['pages/first.html'].html]);
  assert.equal(s.legacyCalls(), 0);
  assert.match(s.nodes['code-copy-status'].textContent, /복사했습니다/);
});

test('picker accepts only its active frame, current token and registered component', async () => {
  const s = setup();
  s.preparePage();
  await s.message('ready', {}, {});
  assert.equal(s.nodes['pick-component'].disabled, true);
  await s.message('ready');
  await s.nodes['pick-component'].emit('click');
  assert.equal(s.nodes['pick-component'].attributes['aria-pressed'], 'true');
  await s.message('component-selected', { id: 'unknown' });
  assert.equal(s.nodes['code-dialog'].open, false);
  await s.message('component-selected', { id: 'card' });
  assert.equal(s.nodes['code-target'].value, 'component:card');
  assert.equal(s.nodes['code-content'].value, '<style>\n.isolated section{color:blue}\n</style>\n\n<div class="isolated"><section>첫 화면</section></div>\n');
  assert.equal(s.nodes['pick-component'].attributes['aria-pressed'], 'false');
  const oldReady = s.ready();
  s.preparePage('pages/second.html');
  await s.message('component-selected', { id: 'card' }, undefined, oldReady);
  assert.equal(s.nodes['code-dialog'].open, false);
  await s.message('ready');
  assert.equal(s.nodes['pick-component'].disabled, true);
});

test('clipboard denial falls back to selected text copy', async () => {
  const s = setup({ clipboardFails: true, legacyCopy: true });
  s.preparePage();
  await s.nodes['open-code'].emit('click');
  await s.nodes['copy-code'].emit('click');
  assert.equal(s.legacyCalls(), 1);
  assert.equal(s.nodes['code-content'].selectionEnd, s.nodes['code-content'].value.length);
  assert.match(s.nodes['code-copy-status'].textContent, /복사했습니다/);
});

test('failed automatic copy leaves code selected and gives manual-copy instruction', async () => {
  const s = setup({ clipboardFails: true, legacyCopy: false });
  s.preparePage();
  await s.nodes['open-code'].emit('click');
  await s.nodes['copy-code'].emit('click');
  assert.match(s.nodes['code-copy-status'].textContent, /⌘C 또는 Ctrl\+C/);
  assert.equal(s.nodes['code-content'].selectionStart, 0);
  assert.equal(s.nodes['code-content'].selectionEnd, s.nodes['code-content'].value.length);
  assert.equal(s.nodes['code-copy-status'].classes.has('copy-error'), true);
});

test('missing source disables code tools and returns to ordinary preview handling', () => {
  const s = setup();
  assert.equal(s.preparePage('pages/unbuilt.html'), false);
  assert.equal(s.nodes['open-code'].disabled, true);
  assert.equal(s.nodes['pick-component'].disabled, true);
  assert.equal(s.api.isBusy(), false);
});


test('frame canvas input validates source/token, transforms zoom point and blocks while tools are busy', async () => {
  const s = setup();
  const received = [];
  s.window.addEventListener('mockup-viewer:canvas-input', (event) => received.push(event.detail));
  s.preparePage();
  const oldReady = s.ready();
  await s.message('ready');
  await s.message('canvas-input', { input: { kind: 'zoom', factor: 1.2, clientX: 600, clientY: 300 } });
  assert.deepEqual(JSON.parse(JSON.stringify(received)), [{ kind: 'zoom', factor: 1.2, clientX: 320, clientY: 180 }]);
  await s.message('canvas-input', { input: { kind: 'pan', deltaX: 20, deltaY: -15 } }, {});
  await s.message('canvas-input', { input: { kind: 'zoom', factor: NaN, clientX: 0, clientY: 0 } });
  assert.equal(received.length, 1);
  await s.nodes['pick-component'].emit('click');
  await s.message('canvas-input', { input: { kind: 'scroll', deltaX: 0, deltaY: 40, deltaMode: 0 } });
  assert.equal(received.length, 1);
  await s.nodes['open-code'].emit('click');
  await s.message('canvas-input', { input: { kind: 'pan-start' } });
  assert.equal(received.length, 1);
  s.preparePage('pages/second.html');
  await s.message('ready');
  await s.message('canvas-input', { input: { kind: 'pan-start' } }, undefined, oldReady);
  assert.equal(received.length, 1);
  await s.message('canvas-input', { input: { kind: 'scroll', deltaX: 2, deltaY: 90, deltaMode: 1 } });
  assert.equal(received.at(-1).deltaY, 90);
});


test('policy target runs the injected bridge, focuses the section and reports document coordinates', async () => {
  const s = setup();
  const layouts = [];
  s.window.addEventListener('mockup-viewer:document-layout', event => layouts.push(event.detail));
  s.preparePage('pages/first.html', { anchor: 'login-policy', page: { id: 'rist-policies', autoHeight: true } });
  await s.message('ready');
  const request = s.hostMessages.findLast(message => message.action === 'document-target');
  assert.equal(request.anchor, 'login-policy');
  const before = s.childMessages.length;
  await s.childRequest(request, {});
  await s.childRequest({ ...request, token: 'stale' });
  assert.equal(s.childMessages.length, before, 'Only the active parent and token can request a document target');
  await s.childRequest(request);
  const layout = s.childMessages.at(-1);
  assert.equal(layout.action, 'document-layout');
  assert.equal(layout.height, 2212);
  assert.deepEqual(JSON.parse(JSON.stringify(layout.anchor)), { id: 'login-policy', top: 912, title: '로그인 정책' });
  assert.equal(s.child().policy.classes.has('is-policy-target'), true);
  assert.deepEqual(JSON.parse(JSON.stringify(s.child().policy.focusOptions)), { preventScroll: true });
  await s.message('document-layout', layout);
  assert.deepEqual(JSON.parse(JSON.stringify(layouts)), [{ pageId: 'rist-policies', height: 2212, anchor: { id: 'login-policy', top: 912, title: '로그인 정책' } }]);
});

test('policy layout replies reject stale frames and missing targets report a null position', async () => {
  const s = setup();
  const layouts = [];
  s.window.addEventListener('mockup-viewer:document-layout', event => layouts.push(event.detail));
  s.preparePage('pages/first.html', { anchor: 'login-policy', page: { id: 'rist-policies', autoHeight: true } });
  const oldReady = s.ready();
  await s.message('document-layout', { height: 2200, anchor: { id: 'login-policy', top: 900 } });
  assert.equal(layouts.length, 0, 'Layout is ignored before the current frame is ready');
  await s.message('ready');
  await s.message('document-layout', { height: 2200 }, {});
  assert.equal(layouts.length, 0);
  s.preparePage('pages/second.html', { anchor: 'missing-policy', page: { id: 'second-policy', autoHeight: true } });
  await s.message('ready');
  await s.message('document-layout', { height: 2200, anchor: { id: 'login-policy', top: 900 } }, undefined, oldReady);
  assert.equal(layouts.length, 0);
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'document-target'));
  const missing = s.childMessages.at(-1);
  assert.deepEqual(JSON.parse(JSON.stringify(missing.anchor)), { id: 'missing-policy', top: null });
  await s.message('document-layout', missing);
  assert.equal(layouts.length, 1);
  assert.equal(layouts[0].anchor.top, null);
});


test('annotation targets follow internal scrolling, hide outside the region and remain absent from copied code', async () => {
  const s = setup({ descriptions: { 'pages/first.html': [
    { id: 'dynamic-marker', targetId: 'field', x: 40, y: 500 },
    { id: 'fallback-marker', targetId: 'missing-field', x: 40, y: 600 }
  ] } });
  const layouts = [];
  s.window.addEventListener('mockup-viewer:annotation-layout', event => layouts.push(event.detail));
  s.preparePage();
  const first = s.childMessages.findLast(message => message.action === 'annotation-layout');
  assert.deepEqual(JSON.parse(JSON.stringify(first.markers)), [
    { id: 'dynamic-marker', top: 232, visible: true },
    { id: 'fallback-marker', top: null, visible: true }
  ]);
  await s.message('annotation-layout', first);
  assert.equal(layouts.length, 0, 'Wait for the active frame readiness');
  await s.message('ready');
  await s.message('annotation-layout', first, {});
  assert.equal(layouts.length, 0, 'Foreign frames cannot move markers');
  await s.message('annotation-layout', first);
  assert.equal(layouts.at(-1).pageId, 'pages/first.html');
  s.child().field.getBoundingClientRect = () => ({ top: 60, height: 40, left: 150, width: 100 });
  await s.child().doc.emit('scroll');
  const scrolled = s.childMessages.at(-1);
  assert.equal(scrolled.action, 'annotation-layout');
  assert.deepEqual(JSON.parse(JSON.stringify(scrolled.markers[0])), { id: 'dynamic-marker', top: 92, visible: false });
  s.child().field.getBoundingClientRect = () => ({ top: 260, height: 40, left: 150, width: 100 });
  await s.childRequest({ channel: 'mockup-viewer-host', token: s.ready().token, action: 'document-target', anchor: '' });
  const refreshed = s.childMessages.at(-1);
  assert.deepEqual(JSON.parse(JSON.stringify(refreshed.markers[0])), { id: 'dynamic-marker', top: 292, visible: true });
  await s.nodes['open-code'].emit('click');
  assert.equal(s.nodes['code-content'].value, s.registry['pages/first.html'].html);
  assert.doesNotMatch(s.nodes['code-content'].value, /annotation-layout|dynamic-marker|reportAnnotationLayout/);
  const oldReady = s.ready();
  s.preparePage('pages/second.html');
  await s.message('ready');
  await s.message('annotation-layout', refreshed, undefined, oldReady);
  assert.equal(layouts.length, 1, 'An earlier page token cannot update current markers');
});


test('static page links allow only registered page IDs from the ready current frame', async () => {
  const s = setup();
  const navigations = [];
  s.window.addEventListener('mockup-viewer:page-link', event => navigations.push(event.detail.pageId));
  s.preparePage('pages/first.html', { page: { id: 'first-page' } });
  const link = s.child().doc.createElement('button');
  link.setAttribute('data-viewer-page', 'second-page');
  link.closest = selector => selector === '[data-viewer-page]' || selector === 'a,button' ? link : null;
  let prevented = 0;
  const click = () => s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
  await click();
  const request = s.childMessages.at(-1);
  assert.equal(request.action, 'page-link');
  assert.equal(request.pageId, 'second-page');
  assert.equal(prevented, 1);
  await s.message('page-link', request);
  assert.equal(navigations.length, 0, 'Unready frames cannot navigate');
  await s.message('ready');
  await s.message('page-link', request, {});
  assert.equal(navigations.length, 0, 'Foreign message sources cannot navigate');
  await s.message('page-link', { pageId: 'second-page', token: 'stale' });
  assert.equal(navigations.length, 0, 'A stale token cannot navigate');
  await s.message('page-link', request);
  assert.deepEqual(navigations, ['second-page']);
  for (const pageId of ['missing-page', 'main-group', 'https://example.com/', '#second-page']) {
    const messagesBefore = s.childMessages.length;
    link.setAttribute('data-viewer-page', pageId);
    await click();
    assert.equal(s.childMessages.length, messagesBefore, 'The frame refuses an unregistered target: ' + pageId);
    await s.message('page-link', { pageId });
  }
  assert.deepEqual(navigations, ['second-page']);
  await s.nodes['open-code'].emit('click');
  assert.equal(s.nodes['code-content'].value, s.registry['pages/first.html'].html);
  assert.doesNotMatch(s.nodes['code-content'].value, /allowedPages|page-link|registeredPageIds/);
  await s.message('page-link', { pageId: 'second-page' });
  assert.equal(navigations.length, 1, 'The code dialog blocks navigation');
  const oldReady = s.ready();
  s.preparePage('pages/second.html', { page: { id: 'second-page' } });
  await s.message('ready');
  await s.message('page-link', { pageId: 'first-page' }, undefined, oldReady);
  assert.equal(navigations.length, 1, 'The prior page cannot navigate after a page change');
  await s.message('page-link', { pageId: 'first-page' });
  assert.deepEqual(navigations, ['second-page', 'first-page']);
});

test('document shortcuts reach only local targets and use the current ready frame', async () => {
  const s = setup();
  const links = [];
  s.window.addEventListener('mockup-viewer:document-link', event => links.push(event.detail));
  s.preparePage('pages/first.html', { page: { id: 'rist-schema', autoHeight: true } });
  const link = s.child().doc.createElement('a');
  link.setAttribute('href', '#analysis_record');
  link.closest = selector => selector === 'a[href^="#"]' || selector === 'a,button' ? link : null;
  s.child().documentRoot.append(link);
  const originalLookup = s.child().doc.getElementById;
  s.child().doc.getElementById = id => id === 'analysis_record' ? s.child().policy : originalLookup(id);
  let prevented = 0;
  const click = () => s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
  await click();
  const request = s.childMessages.at(-1);
  assert.equal(request.action, 'document-link');
  assert.equal(request.anchor, 'analysis_record');
  assert.equal(prevented, 1);
  await s.message('document-link', request);
  assert.equal(links.length, 0);
  await s.message('ready');
  await s.message('document-link', request, {});
  await s.message('document-link', { anchor: 'analysis_record', token: 'stale' });
  assert.equal(links.length, 0);
  await s.message('document-link', request);
  assert.deepEqual(JSON.parse(JSON.stringify(links)), [{ pageId: 'rist-schema', anchor: 'analysis_record' }]);
  for (const href of ['#missing', '#../invalid']) {
    link.setAttribute('href', href);
    const before = s.childMessages.length;
    await click();
    assert.equal(s.childMessages.length, before);
  }
  await s.nodes['open-code'].emit('click');
  await s.message('document-link', request);
  assert.equal(links.length, 1);
  assert.doesNotMatch(s.nodes['code-content'].value, /document-link/);
});

test('document download preserves native activation only for embedded Markdown in the document', async () => {
  const s = setup();
  s.preparePage();
  await s.message('ready');
  const link = s.child().doc.createElement('a');
  link.closest = selector => selector === 'a[data-document-download]' || selector === 'a,button' ? link : null;
  link.setAttribute('href', 'data:text/markdown;charset=utf-8;base64,IyBIZWxsbw==');
  link.setAttribute('download', '정책 문서.md');
  s.child().documentRoot.append(link);
  let prevented = 0;
  const click = () => s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
  await click();
  assert.equal(prevented, 0, 'The browser handles the download directly in the click gesture');
  assert.match(shell, /sandbox="allow-scripts allow-downloads"/);
  for (const href of ['https://example.invalid/a.md', 'file:///private/file.md', 'data:text/html;base64,IyBIZWxsbw==']) {
    link.setAttribute('href', href);
    await click();
  }
  assert.equal(prevented, 3);
  link.setAttribute('href', 'data:text/markdown;charset=utf-8;base64,IyBIZWxsbw==');
  link.setAttribute('download', '../policy.md');
  await click();
  assert.equal(prevented, 4);
  link.setAttribute('download', '통합 스키마.md');
  await s.childRequest({ channel: 'mockup-viewer-host', token: s.ready().token, action: 'pick-mode', active: true });
  await click();
  assert.equal(prevented, 5, 'Component selection still takes priority');
});

test('supported embedded sample downloads retain native activation and original byte payloads', async () => {
  const s = setup();
  s.preparePage();
  await s.message('ready');
  const types = {
    csv: 'text/csv', pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel'
  };
  let prevented = 0;
  const messagesBefore = s.childMessages.length;
  for (const [extension, mime] of Object.entries(types)) {
    const payload = Buffer.from([0xef, 0xbb, 0xbf, 0, 255, 13, 10, 3, 4]);
    const link = s.child().doc.createElement('a');
    const href = 'data:' + mime + ';base64,' + payload.toString('base64');
    link.closest = selector => selector === 'a[data-sample-download]' || selector === 'a,button' ? link : null;
    link.setAttribute('href', href);
    link.setAttribute('download', '원본 샘플.' + extension);
    s.child().documentRoot.append(link);
    await s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
    assert.equal(prevented, 0, extension + ' uses the original browser click gesture');
    assert.equal(link.getAttribute('href'), href, 'The bridge never rewrites or transcodes the payload');
    assert.deepEqual(Buffer.from(link.getAttribute('href').split(',')[1], 'base64'), payload);
  }
  assert.equal(s.childMessages.length, messagesBefore, 'Downloads never use asynchronous bridge messages');
});

test('sample downloads reject nonlocal URLs, MIME or extension mismatches and malformed payloads', async () => {
  const s = setup();
  s.preparePage();
  await s.message('ready');
  const link = s.child().doc.createElement('a');
  link.closest = selector => selector === 'a[data-sample-download]' || selector === 'a,button' ? link : null;
  s.child().documentRoot.append(link);
  const csv = 'data:text/csv;base64,YSxiDQo=';
  const invalid = [
    ['https://example.invalid/sample.csv', '샘플.csv'],
    ['file:///private/sample.csv', '샘플.csv'],
    ['../samples/sample.csv', '샘플.csv'],
    ['data:text/html;base64,YSxiDQo=', '샘플.csv'],
    ['data:application/pdf;base64,YSxiDQo=', '샘플.csv'],
    ['data:application/vnd.ms-excel;base64,YSxiDQo=', '샘플.xlsx'],
    ['data:text/csv;charset=utf-8;base64,YSxiDQo=', '샘플.csv'],
    ['data:text/csv;base64,YSxiDQo=#fragment', '샘플.csv'],
    ['data:text/csv;base64,invalid', '샘플.csv'],
    ['data:text/csv;base64,A===', '샘플.csv'],
    [csv, '샘플.pdf'], [csv, '샘플.html'], [csv, '샘플.csv.exe'],
    [csv, '../샘플.csv'], [csv, 'folder\\샘플.csv'], [csv, '샘플\x00.csv'],
    [csv, '샘플\x7f.csv'], [csv, '.csv'], [csv, '']
  ];
  let prevented = 0;
  for (const [href, filename] of invalid) {
    link.setAttribute('href', href);
    link.setAttribute('download', filename);
    const before = prevented;
    await s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
    assert.equal(prevented, before + 1, 'Rejected ' + href + ' as ' + JSON.stringify(filename));
  }
  link.setAttribute('href', csv);
  link.setAttribute('download', '샘플.csv');
  s.child().documentRoot.replaceChildren();
  await s.child().doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {} });
  assert.equal(prevented, invalid.length + 1, 'A valid sample link outside the document is blocked');
});

test('sample downloads are blocked while picking, opening code, showing preview dialogs or panning', async () => {
  const s = setup();
  s.preparePage();
  await s.message('ready');
  const child = s.child();
  const link = child.doc.createElement('a');
  link.closest = selector => selector === 'a[data-sample-download]' || selector === 'a,button' ? link : null;
  link.setAttribute('href', 'data:text/csv;base64,YSxiDQo=');
  link.setAttribute('download', '샘플.csv');
  child.documentRoot.append(link);
  let prevented = 0;
  const click = (extra = {}) => child.doc.emit('click', { target: link, preventDefault() { prevented++; }, stopPropagation() {}, ...extra });
  await s.nodes['pick-component'].emit('click');
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'pick-mode'));
  await click();
  assert.equal(prevented, 1, 'Code component picking takes priority over downloading');
  await s.nodes['open-code'].emit('click');
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'pick-mode'));
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'canvas-reset'));
  await click();
  assert.equal(prevented, 2, 'The host code dialog blocks download activation');
  await s.nodes['close-code'].emit('click');
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'canvas-reset'));
  const originalQuery = child.doc.querySelector;
  child.doc.querySelector = selector => selector === 'dialog[open]' ? {} : originalQuery(selector);
  await click();
  assert.equal(prevented, 3, 'Authored preview dialogs also block download activation');
  child.doc.querySelector = originalQuery;
  child.doc.documentElement.classList.add('is-panning');
  await click();
  assert.equal(prevented, 4, 'Panning cannot activate a sample download');
  child.doc.documentElement.classList.remove('is-panning');
  await click({ defaultPrevented: true });
  assert.equal(prevented, 5, 'A canceled gesture remains canceled');
  await click();
  assert.equal(prevented, 5, 'Native download activation resumes once the blocking state ends');
});

test('cross-page links retain optional validated anchors through the current frame bridge', async () => {
  const s = setup();
  const navigations = [];
  s.window.addEventListener('mockup-viewer:page-link', event => navigations.push(JSON.parse(JSON.stringify(event.detail))));
  s.preparePage('pages/first.html', { page: { id: 'first-page' } });
  const link = s.child().doc.createElement('a');
  link.setAttribute('data-viewer-page', 'second-page');
  link.setAttribute('data-viewer-anchor', 'review_record-2');
  link.closest = selector => selector === '[data-viewer-page]' || selector === 'a,button' ? link : null;
  const click = () => s.child().doc.emit('click', { target: link, preventDefault() {}, stopPropagation() {} });
  await click();
  const request = s.childMessages.at(-1);
  assert.equal(request.action, 'page-link');
  assert.equal(request.anchor, 'review_record-2');
  await s.message('page-link', request);
  assert.equal(navigations.length, 0, 'Anchor requests also wait for frame readiness');
  await s.message('ready');
  await s.message('page-link', request, {});
  await s.message('page-link', { ...request, token: 'stale' });
  assert.equal(navigations.length, 0, 'Foreign or stale frames cannot request an anchor route');
  await s.message('page-link', request);
  assert.deepEqual(navigations, [{ pageId: 'second-page', anchor: 'review_record-2' }]);
  for (const anchor of ['', '../private', 'csv/extra', '#csv', '한글', 'csv?query', 'csv%2Fextra']) {
    link.setAttribute('data-viewer-anchor', anchor);
    const before = s.childMessages.length;
    await click();
    assert.equal(s.childMessages.length, before, 'Frame refuses invalid anchor ' + anchor);
    await s.message('page-link', { pageId: 'second-page', anchor });
  }
  for (const anchor of [null, 42, {}, []]) await s.message('page-link', { pageId: 'second-page', anchor });
  assert.equal(navigations.length, 1, 'Host independently validates anchor characters and type');
  link.removeAttribute('data-viewer-anchor');
  await click();
  const noAnchor = s.childMessages.at(-1);
  assert.equal(Object.hasOwn(noAnchor, 'anchor'), false);
  await s.message('page-link', noAnchor);
  assert.deepEqual(navigations.at(-1), { pageId: 'second-page' }, 'Existing callers retain the same event shape');
  const oldReady = s.ready();
  s.preparePage('pages/second.html', { page: { id: 'second-page' } });
  await s.message('ready');
  await s.message('page-link', { pageId: 'first-page', anchor: 'csv' }, undefined, oldReady);
  assert.equal(navigations.length, 2, 'An earlier frame cannot navigate the next page');
});

test('component selection takes priority over a static page link', async () => {
  const s = setup();
  const navigations = [];
  s.window.addEventListener('mockup-viewer:page-link', event => navigations.push(event.detail));
  s.preparePage('pages/first.html', { page: { id: 'first-page' } });
  await s.message('ready');
  const component = s.child().doc.createElement('section');
  component.setAttribute('data-component', 'card');
  const link = s.child().doc.createElement('button');
  link.setAttribute('data-viewer-page', 'second-page');
  link.closest = selector => selector === '[data-component]' ? component : selector === '[data-viewer-page]' || selector === 'a,button' ? link : null;
  await s.nodes['pick-component'].emit('click');
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'pick-mode'));
  await s.message('page-link', { pageId: 'second-page' });
  assert.equal(navigations.length, 0, 'Host rejects navigation while picking');
  const before = s.childMessages.length;
  await s.child().doc.emit('click', { target: link, preventDefault() {}, stopPropagation() {} });
  const emitted = s.childMessages.slice(before);
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].action, 'component-selected');
  assert.equal(emitted[0].id, 'card');
  await s.message('component-selected', emitted[0]);
  assert.equal(s.nodes['code-target'].value, 'component:card');
  assert.equal(s.nodes['code-dialog'].open, true);
  assert.equal(navigations.length, 0);
});


test('authored preview dialogs open, cancel and route only through allowed confirmation links', async () => {
  const s = setup();
  s.preparePage('pages/first.html', { page: { id: 'first-page' } });
  await s.message('ready');
  const child = s.child();
  const previewDialog = child.doc.createElement('dialog');
  previewDialog.tagName = 'DIALOG';
  const originalLookup = child.doc.getElementById;
  child.doc.getElementById = id => id === 'save-confirm' ? previewDialog : originalLookup(id);
  const originalQuery = child.doc.querySelector;
  child.doc.querySelector = selector => selector === 'dialog[open]' ? (previewDialog.open ? previewDialog : null) : originalQuery(selector);
  const opener = child.doc.createElement('button');
  opener.setAttribute('data-viewer-dialog', 'save-confirm');
  opener.closest = selector => selector === '[data-viewer-dialog]' || selector === 'a,button' ? opener : null;
  const cancel = child.doc.createElement('button');
  cancel.closest = selector => selector === '[data-viewer-dialog-close]' || selector === 'a,button' ? cancel : selector === 'dialog' ? previewDialog : null;
  const confirm = child.doc.createElement('button');
  confirm.setAttribute('data-viewer-page', 'second-page');
  confirm.closest = selector => selector === '[data-viewer-page]' || selector === 'a,button' ? confirm : selector === 'dialog' ? previewDialog : null;
  const click = target => child.doc.emit('click', { target, preventDefault() {}, stopPropagation() {} });
  const before = s.childMessages.length;
  await click(opener);
  assert.equal(previewDialog.open, true);
  assert.equal(child.doc.documentElement.canvasOptions.isBlocked(), true, 'Modal content blocks canvas movement');
  let keyboardPrevented = 0;
  for (const key of ['ArrowLeft', 'ArrowRight', 'Escape']) {
    await child.doc.emit('keydown', { target: cancel, key, preventDefault() { keyboardPrevented++; } });
  }
  assert.equal(keyboardPrevented, 0, 'Native dialog keyboard handling, including Escape, is preserved');
  assert.equal(s.childMessages.length, before, 'Open dialogs suppress previous/next routing');
  await click(cancel);
  assert.equal(previewDialog.open, false);
  assert.equal(child.doc.documentElement.canvasOptions.isBlocked(), false, 'Canvas movement resumes when the dialog closes');
  assert.equal(s.childMessages.length, before, 'Opening and canceling a preview dialog never navigate');
  await click(opener);
  confirm.setAttribute('data-viewer-page', 'https://example.com/');
  await click(confirm);
  assert.equal(previewDialog.open, true, 'Invalid routes cannot close the confirmation dialog');
  assert.equal(s.childMessages.length, before);
  confirm.setAttribute('data-viewer-page', 'second-page');
  confirm.disabled = true;
  await click(confirm);
  assert.equal(previewDialog.open, true);
  assert.equal(s.childMessages.length, before);
  confirm.disabled = false;
  await click(confirm);
  assert.equal(previewDialog.open, false);
  assert.equal(s.childMessages.at(-1).action, 'page-link');
  assert.equal(s.childMessages.at(-1).pageId, 'second-page');
  await s.nodes['open-code'].emit('click');
  assert.equal(s.nodes['code-content'].value, s.registry['pages/first.html'].html);
  assert.doesNotMatch(s.nodes['code-content'].value, /dialogOpener|previewDialog|showModal/);
});

test('preview dialog openers reject missing, invalid, unsupported and disabled targets and preserve picker priority', async () => {
  const s = setup();
  s.preparePage('pages/first.html', { page: { id: 'first-page' } });
  await s.message('ready');
  const child = s.child();
  const previewDialog = child.doc.createElement('dialog');
  previewDialog.tagName = 'DIALOG';
  let opened = 0;
  previewDialog.showModal = () => { opened++; previewDialog.open = true; };
  const nonDialog = child.doc.createElement('div');
  nonDialog.tagName = 'DIV';
  nonDialog.showModal = () => { throw new Error('Only dialog elements can open'); };
  const unsupportedDialog = child.doc.createElement('dialog');
  unsupportedDialog.tagName = 'DIALOG';
  unsupportedDialog.showModal = undefined;
  const originalLookup = child.doc.getElementById;
  const known = { 'save-confirm': previewDialog, 'not-a-dialog': nonDialog, unsupported: unsupportedDialog };
  child.doc.getElementById = id => known[id] || originalLookup(id);
  const component = child.doc.createElement('section');
  component.setAttribute('data-component', 'card');
  const opener = child.doc.createElement('button');
  opener.closest = selector => selector === '[data-component]' ? component : selector === '[data-viewer-dialog]' || selector === 'a,button' ? opener : null;
  const click = () => child.doc.emit('click', { target: opener, preventDefault() {}, stopPropagation() {} });
  for (const id of ['missing', '#save-confirm', 'https://example.com/', 'not-a-dialog', 'unsupported']) {
    opener.setAttribute('data-viewer-dialog', id);
    await click();
  }
  assert.equal(opened, 0);
  opener.setAttribute('data-viewer-dialog', 'save-confirm');
  opener.disabled = true;
  await click();
  assert.equal(opened, 0);
  opener.disabled = false;
  await s.nodes['pick-component'].emit('click');
  await s.childRequest(s.hostMessages.findLast(message => message.action === 'pick-mode'));
  await click();
  assert.equal(opened, 0, 'Component selection must not open the authored dialog');
  assert.equal(s.childMessages.at(-1).action, 'component-selected');
  assert.equal(s.childMessages.at(-1).id, 'card');
  await click();
  await click();
  assert.equal(opened, 1, 'An already open dialog is not opened a second time');
});
