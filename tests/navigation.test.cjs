'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/viewer.js'), 'utf8');

// Minimal DOM surface for executing the real viewer, without duplicating navigation logic.
class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
    this.style = {}; this.dataset = {}; this.listeners = {}; this.hidden = false;
    this.disabled = false; this.scrollTop = 0; this.scrollLeft = 0;
    this.clientWidth = 1100; this.clientHeight = 700; this._text = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; this._text = ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(n => n.textContent || '').join(''); }
  set href(value) { this.setAttribute('href', value); }
  get href() { return this.getAttribute('href'); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, event = {}) { for (const fn of this.listeners[type] || []) fn({ target: this, detail: 0, preventDefault() {}, ...event }); }
  click() { if (!this.disabled) this.dispatch('click'); }
  contains(node) { return this === node || this.children.some(child => child.contains?.(node)); }
  closest() { return null; }
  focus() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
}
function boot({ hash = '#rist-cover', tree, descriptions, zoom = 1, storage = { getItem: () => null, setItem() {} } } = {}) {
  const nodes = new Map();
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
  const document = new Element('document');
  document.getElementById = get;
  document.createElement = tag => new Element(tag);
  document.createTextNode = text => { const node = new Element('#text'); node.textContent = text; return node; };
  document.createElementNS = (_ns, tag) => new Element(tag);
  document.activeElement = null;
  const window = new Element('window');
  window.getSelection = () => ({ isCollapsed: true });
  window.MockupCanvasMath = { minZoom: .25, maxZoom: 2, clampZoom: n => n, widthFit: () => zoom };
  window.MockupCanvasInput = () => ({ reset() {}, setSpace() {} });
  const setPages = [];
  window.MockupCodeTools = { isBusy: () => false, setPage: (page, anchor) => { setPages.push({ id: page.id, anchor }); return true; }, setCanvasSpace() {} };
  let currentHash = hash;
  const location = {};
  Object.defineProperty(location, 'hash', {
    get: () => currentHash,
    set: value => { if (currentHash !== value) { currentHash = value; window.dispatch('hashchange'); } }
  });
  const context = vm.createContext({ window, document, location,
    localStorage: storage,
    requestAnimationFrame: () => 1, cancelAnimationFrame() {}, setTimeout, clearTimeout });
  vm.runInContext(fs.readFileSync(path.join(root, 'data/extraction-rules.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'data/manifest.js'), 'utf8'), context);
  if (tree) window.MOCKUP_VIEWER_MANIFEST = { tree };
  vm.runInContext(fs.readFileSync(path.join(root, 'data/descriptions.js'), 'utf8'), context);
  if (descriptions) window.MOCKUP_VIEWER_DESCRIPTIONS = descriptions;
  vm.runInContext(source, context, { filename: 'viewer.js' });
  function all(node) { return [node, ...node.children.flatMap(all)]; }
  const pageButton = id => all(get('page-tree')).find(n => n.dataset.pageId === id);
  return { get, location, pageButton, setPages,
    descendants: id => all(get(id)),
    layout: detail => window.dispatch('mockup-viewer:document-layout', { detail }),
    annotationLayout: detail => window.dispatch('mockup-viewer:annotation-layout', { detail }),
    key: key => document.dispatch('keydown', { key, target: get('canvas-viewport') }),
    iframe: direction => window.dispatch('mockup-viewer:navigate', { detail: { direction } }),
    pageLink: (pageId, anchor) => window.dispatch('mockup-viewer:page-link', { detail: { pageId, ...(anchor === undefined ? {} : { anchor }) } }),
    documentLink: detail => window.dispatch('mockup-viewer:document-link', { detail }),
    counter: () => get('page-counter').textContent.replace(/\s/g, ''),
    current: () => get('page-id').textContent };
}
function expectPage(app, id, counter) {
  assert.equal(app.current(), id);
  assert.equal(app.counter(), counter);
}

test('screen planning pages stay within their seventeen-page list through buttons and keyboard routes', () => {
  const app = boot();
  const ids = ['rist-cover', 'rist-login', 'rist-upload', 'rist-processing', 'rist-error', 'rist-review-preparation-initial', 'rist-review-preparation-stage-confirm', 'rist-review-preparation-dropdown', 'rist-review-preparation-search', 'rist-review-preparation-search-empty', 'rist-review-preparation-direct-input', 'rist-review-preparation-region-examples', 'rist-review-preparation-date-time', 'rist-review-preparation-selected', 'rist-review-preparation-changed', 'rist-review-preparation-add-modals', 'rist-review-detail'];
  const markers = [0, 2, 4, 3, 3, 1, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 7];
  assert.equal(app.get('page-breadcrumb').textContent, '화면 기획서');
  app.get('previous-page').click(); app.key('ArrowLeft'); app.iframe('previous');
  expectPage(app, 'rist-cover', '01/17');
  ids.forEach((id, index) => {
    expectPage(app, id, String(index + 1).padStart(2, '0') + '/17');
    assert.equal(app.get('annotation-layer').children.length, markers[index]);
    if (id.startsWith('rist-review-preparation-') && !['rist-review-preparation-initial', 'rist-review-preparation-search', 'rist-review-preparation-region-examples'].includes(id)) {
      assert.equal(app.get('description-list').children.length, 0);
      assert.equal(app.get('description-page-summary').textContent, '');
    }
    if (index % 3 === 0) app.get('next-page').click();
    else if (index % 3 === 1) app.key('ArrowRight');
    else app.iframe('next');
  });
  assert.equal(app.get('next-page').disabled, true);
  app.get('next-page').click(); app.key('ArrowRight'); app.iframe('next');
  expectPage(app, 'rist-review-detail', '17/17');
  assert.equal(app.get('description-page-label').textContent, '현재 화면 · 17');
  for (let i = ids.length - 2; i >= 0; i--) {
    app.key('ArrowLeft');
    expectPage(app, ids[i], String(i + 1).padStart(2, '0') + '/17');
  }
});

test('policy list contains four documents and stops at both list boundaries', () => {
  const app = boot({ hash: '#rist-policies' });
  const ids = ['rist-policies', 'rist-schema', 'rist-policy-link-example', 'rist-llm-flow'];
  assert.equal(app.get('page-breadcrumb').textContent, '정책');
  assert.equal(app.get('previous-page').disabled, true);
  app.iframe('previous');
  ids.forEach((id, index) => {
    expectPage(app, id, String(index + 1).padStart(2, '0') + '/04');
    app.iframe('next');
  });
  assert.equal(app.get('next-page').disabled, true);
  app.key('ArrowRight'); app.get('next-page').click();
  expectPage(app, 'rist-llm-flow', '04/04');
  app.get('previous-page').click();
  expectPage(app, 'rist-policy-link-example', '03/04');
});

test('login description links cross from screen planning to the policy list without changing IDs', () => {
  const app = boot({ hash: '#rist-login' });
  expectPage(app, 'rist-login', '02/17');
  const link = app.descendants('description-list').find(node => node.tagName === 'A');
  assert.equal(link.href, '#rist-policies/login-policy');
  link.click();
  expectPage(app, 'rist-policies', '01/04');
  assert.equal(app.get('page-breadcrumb').textContent, '정책');
  assert.deepEqual(app.setPages.at(-1), { id: 'rist-policies', anchor: 'login-policy' });
  app.pageLink('rist-login');
  expectPage(app, 'rist-login', '02/17');
});

test('schema table shortcuts preserve their fragment and remain in the schema page', () => {
  const app = boot({ hash: '#rist-schema', zoom: .5 });
  expectPage(app, 'rist-schema', '02/04');
  app.documentLink({ pageId: 'rist-schema', anchor: 'analysis_record' });
  assert.equal(app.location.hash, '#rist-schema/analysis_record');
  assert.deepEqual(app.setPages.at(-1), { id: 'rist-schema', anchor: 'analysis_record' });
  app.layout({ pageId: 'rist-schema', height: 22000, anchor: { id: 'analysis_record', top: 3600, title: 'analysis_record' } });
  assert.equal(app.get('artboard').style.height, '22000px');
  assert.equal(app.get('canvas-viewport').scrollTop, 1776);
  const loads = app.setPages.length;
  app.documentLink({ pageId: 'rist-schema', anchor: 'analysis_record' });
  assert.equal(app.setPages.length, loads + 1);
  app.documentLink({ pageId: 'rist-policies', anchor: 'login-policy' });
  app.documentLink({ pageId: 'rist-schema', anchor: '../invalid' });
  assert.equal(app.location.hash, '#rist-schema/analysis_record');
  app.get('next-page').click();
  expectPage(app, 'rist-policy-link-example', '03/04');
});

test('guide pages navigate within 1/3 to 3/3 and stop at both boundaries', () => {
  const app = boot({ hash: '#viewer-overview' });
  expectPage(app, 'viewer-overview', '01/03');
  app.key('ArrowLeft'); app.iframe('previous'); app.get('previous-page').click();
  expectPage(app, 'viewer-overview', '01/03');
  app.get('next-page').click();
  expectPage(app, 'annotation-example', '02/03');
  app.key('ArrowRight');
  expectPage(app, 'long-page-example', '03/03');
  assert.equal(app.get('next-page').disabled, true);
  app.get('next-page').click(); app.iframe('next'); app.key('ArrowRight');
  expectPage(app, 'long-page-example', '03/03');
  app.iframe('previous');
  expectPage(app, 'annotation-example', '02/03');
  app.get('previous-page').click();
  expectPage(app, 'viewer-overview', '01/03');
});

test('direct tree selection and hash links still cross lists and refresh numbering', () => {
  const app = boot();
  app.pageButton('annotation-example').click();
  expectPage(app, 'annotation-example', '02/03');
  app.pageButton('rist-cover').click();
  expectPage(app, 'rist-cover', '01/17');
  app.location.hash = '#long-page-example';
  expectPage(app, 'long-page-example', '03/03');
  assert.equal(app.pageButton('long-page-example').getAttribute('aria-current'), 'page');
  app.location.hash = '#rist-cover';
  expectPage(app, 'rist-cover', '01/17');
});

test('nested groups share their top-level sequence and do not enter the next top-level list', () => {
  const page = id => ({ id, title: id, src: 'pages/' + id + '.html' });
  const tree = [
    { id: 'a', title: 'A', children: [page('a1'), { id: 'nested', title: 'Nested', children: [page('a2'), { id: 'deep', children: [page('a3')] }] }, page('a4')] },
    { id: 'b', title: 'B', children: [page('b1')] }
  ];
  const app = boot({ hash: '#a1', tree });
  for (let i = 1; i <= 4; i++) {
    expectPage(app, 'a' + i, '0' + i + '/04');
    app.iframe('next');
  }
  expectPage(app, 'a4', '04/04');
  app.key('ArrowRight');
  expectPage(app, 'a4', '04/04');
  app.pageButton('b1').click();
  expectPage(app, 'b1', '01/01');
  app.iframe('previous');
  expectPage(app, 'b1', '01/01');
  app.location.hash = '#a2';
  app.key('ArrowLeft');
  expectPage(app, 'a1', '01/04');
});


test('description links preserve readable text and route to the policy anchor', () => {
  const app = boot({ hash: '#rist-policy-link-example', descriptions: {
    'rist-policy-link-example': [{ id: 'policy', title: '정책', body: '참조: [로그인 정책](#rist-policies/login-policy). [미등록](#unknown/missing) <script>unsafe</script>' }]
  }});
  const links = app.descendants('description-list').filter(node => node.tagName === 'A');
  assert.equal(links.length, 1);
  assert.equal(links[0].textContent, '로그인 정책');
  assert.equal(links[0].getAttribute('href'), '#rist-policies/login-policy');
  assert.match(app.get('description-list').textContent, /\[미등록\]\(#unknown\/missing\) <script>unsafe<\/script>/);
  assert.equal(app.descendants('description-list').some(node => node.tagName === 'SCRIPT'), false);
  links[0].click();
  expectPage(app, 'rist-policies', '01/04');
  assert.equal(app.location.hash, '#rist-policies/login-policy');
  assert.deepEqual(app.setPages.at(-1), { id: 'rist-policies', anchor: 'login-policy' });
  const pageLoads = app.setPages.length;
  links[0].click();
  assert.equal(app.setPages.length, pageLoads + 1, 'Selecting the same link requests the anchor again');
  app.location.hash = '#rist-policies/login-policy';
  assert.equal(app.setPages.at(-1).anchor, 'login-policy');
});

test('policy document height and anchor position honor zoom and ignore other pages', () => {
  const app = boot({ hash: '#rist-policies/login-policy', zoom: .5 });
  app.get('artboard').getBoundingClientRect = () => ({ top: 100, left: 0 });
  app.get('canvas-viewport').getBoundingClientRect = () => ({ top: 80, left: 0 });
  app.get('canvas-viewport').scrollTop = 60;
  app.layout({ pageId: 'rist-policies', height: 2400, anchor: { id: 'login-policy', top: 900, title: '로그인 정책' } });
  assert.equal(app.get('artboard').style.height, '2400px');
  assert.equal(app.get('artboard-shell').style.height, '1200px');
  assert.equal(app.get('canvas-viewport').scrollTop, 60 + 100 - 80 + 900 * .5 - 24);
  assert.match(app.get('viewer-status').textContent, /로그인 정책 항목으로 이동했습니다/);
  const scrollTop = app.get('canvas-viewport').scrollTop;
  app.layout({ pageId: 'viewer-overview', height: 9000, anchor: { id: 'login-policy', top: 2000 } });
  assert.equal(app.get('artboard').style.height, '2400px');
  assert.equal(app.get('canvas-viewport').scrollTop, scrollTop);
  app.layout({ pageId: 'rist-policies', anchor: { id: 'different-policy', top: 1500 } });
  assert.equal(app.get('canvas-viewport').scrollTop, scrollTop);
  app.layout({ pageId: 'rist-policies', anchor: { id: 'login-policy', top: null } });
  assert.match(app.get('viewer-status').textContent, /항목을 찾을 수 없습니다/);
  app.layout({ pageId: 'rist-policies', height: 700 });
  assert.equal(app.get('artboard').style.height, '700px');
  assert.equal(app.get('artboard-shell').style.height, '350px');
  app.layout({ pageId: 'rist-policies', height: 3100 });
  assert.equal(app.get('artboard').style.height, '3100px');
  assert.equal(app.get('artboard-shell').style.height, '1550px');
});

test('basic flow uses screen ID labels without overlay markers and keeps its policy link', () => {
  const app = boot({ hash: '#rist-policy-link-example' });
  const codes = app.descendants('description-list').filter(node => node.className === 'description-number description-code');
  assert.deepEqual(codes.map(node => node.textContent), ['U-01', 'U-02', 'U-03', 'U-04', 'M-03', 'U-05', 'U-06', 'U-07']);
  assert.equal(app.get('annotation-layer').children.length, 0);
  const cards = app.descendants('description-list').filter(node => node.dataset.annotationId);
  assert.equal(cards[0].getAttribute('aria-label'), 'U-01: 로그인');
  const policyLink = app.descendants('description-list').find(node => node.tagName === 'A');
  assert.equal(policyLink.textContent, '로그인 정책');
  policyLink.click();
  expectPage(app, 'rist-policies', '01/04');
  assert.equal(app.setPages.at(-1).anchor, 'login-policy');
  app.pageButton('viewer-overview').click();
  const numbers = app.descendants('description-list').filter(node => node.className === 'description-number');
  assert.deepEqual(numbers.map(node => node.textContent), ['1', '2', '3', '4']);
  assert.equal(app.get('annotation-layer').children.length, 4);
});


test('annotation visibility keeps descriptions available and persists across pages and reloads', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  const app = boot({ hash: '#rist-login', storage });
  const button = app.get('toggle-annotations');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(app.get('annotation-layer').hidden, false);
  assert.equal(app.get('annotation-layer').children.length, 2);
  const descriptions = app.get('description-list').textContent;
  const cards = [...app.get('description-list').children];
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(app.get('annotation-layer').hidden, true);
  assert.equal(app.get('description-list').hidden, false);
  assert.equal(app.get('description-list').textContent, descriptions);
  assert.deepEqual(app.get('description-list').children, cards);
  assert.equal(JSON.parse(values.get('mockup-viewer-preferences-v1')).annotationsVisible, false);
  app.pageButton('annotation-example').click();
  assert.ok(app.get('annotation-layer').children.length > 0);
  assert.equal(app.get('annotation-layer').hidden, true);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  const restored = boot({ hash: '#rist-login', storage });
  assert.equal(restored.get('toggle-annotations').getAttribute('aria-pressed'), 'false');
  assert.equal(restored.get('annotation-layer').hidden, true);
  restored.get('toggle-annotations').click();
  assert.equal(restored.get('annotation-layer').hidden, false);
  assert.equal(restored.get('toggle-annotations').getAttribute('aria-pressed'), 'true');
  assert.equal(JSON.parse(values.get('mockup-viewer-preferences-v1')).annotationsVisible, true);
  const enabledAgain = boot({ hash: '#rist-login', storage });
  assert.equal(enabledAgain.get('toggle-annotations').getAttribute('aria-pressed'), 'true');
  assert.equal(enabledAgain.get('annotation-layer').hidden, false);
});

test('annotation visibility still toggles when local storage is unavailable', () => {
  const unavailable = () => { throw new Error('Storage unavailable'); };
  const app = boot({ hash: '#rist-login', storage: { getItem: unavailable, setItem: unavailable } });
  assert.equal(app.get('toggle-annotations').getAttribute('aria-pressed'), 'true');
  assert.equal(app.get('annotation-layer').hidden, false);
  app.get('toggle-annotations').click();
  assert.equal(app.get('toggle-annotations').getAttribute('aria-pressed'), 'false');
  assert.equal(app.get('annotation-layer').hidden, true);
  app.get('toggle-annotations').click();
  assert.equal(app.get('toggle-annotations').getAttribute('aria-pressed'), 'true');
  assert.equal(app.get('annotation-layer').hidden, false);
});


test('target markers follow frame coordinates while fixed markers and descriptions stay unchanged', () => {
  const app = boot({ hash: '#rist-login', descriptions: {
    'rist-login': [
      { id: 'moving', targetId: 'field', title: 'Moving', body: 'Description', x: 40, y: 500 },
      { id: 'fixed', title: 'Fixed', body: 'Description', x: 60, y: 150 }
    ]
  } });
  const [moving, fixed] = app.get('annotation-layer').children;
  assert.equal(moving.hidden, true, 'Keep a target marker hidden until its frame position is measured');
  assert.equal(fixed.hidden, false);
  const descriptionText = app.get('description-list').textContent;
  app.annotationLayout({ pageId: 'rist-upload', markers: [{ id: 'moving', top: 230, visible: true }] });
  assert.equal(moving.style.top, '500px');
  app.annotationLayout({ pageId: 'rist-login', markers: [
    { id: 'moving', top: 230, visible: true }, { id: 'fixed', top: 300, visible: false }, { id: 'unknown', top: 2, visible: true }
  ] });
  assert.equal(moving.style.top, '230px');
  assert.equal(moving.style.left, '40px');
  assert.equal(moving.hidden, false);
  assert.equal(fixed.style.top, '150px');
  assert.equal(fixed.hidden, false);
  app.annotationLayout({ pageId: 'rist-login', markers: [{ id: 'moving', top: -30, visible: false }] });
  assert.equal(moving.hidden, true);
  app.annotationLayout({ pageId: 'rist-login', markers: [{ id: 'moving', top: null, visible: true }] });
  assert.equal(moving.style.top, '500px', 'Missing targets use the configured fallback');
  assert.equal(moving.hidden, false);
  assert.equal(app.get('description-list').textContent, descriptionText);
});


test('review stage tabs and footer page links route between registered pages without entering groups', () => {
  const app = boot({ hash: '#rist-review-preparation-initial' });
  app.pageLink('rist-review-detail');
  expectPage(app, 'rist-review-detail', '17/17');
  assert.equal(app.location.hash, '#rist-review-detail');
  app.pageLink('rist-review-detail');
  app.pageLink('rist');
  app.pageLink('missing-page');
  expectPage(app, 'rist-review-detail', '17/17');
  app.pageLink('rist-review-preparation-initial');
  expectPage(app, 'rist-review-preparation-initial', '06/17');
});


test('extraction rule pages share a separate index-first scope and preserve document anchor links', () => {
  const app = boot({ hash: '#extraction-rules-index' });
  expectPage(app, 'extraction-rules-index', '01/03');
  assert.equal(app.get('page-breadcrumb').textContent, '추출 규칙');
  app.key('ArrowLeft');
  expectPage(app, 'extraction-rules-index', '01/03');
  app.pageLink('extraction-rule-csv-001');
  expectPage(app, 'extraction-rule-csv-001', '02/03');
  app.key('ArrowRight');
  expectPage(app, 'extraction-rule-pdf-001', '03/03');
  app.iframe('next'); app.get('next-page').click();
  expectPage(app, 'extraction-rule-pdf-001', '03/03');
  app.pageLink('rist-schema', 'review_record');
  expectPage(app, 'rist-schema', '02/04');
  assert.equal(app.location.hash, '#rist-schema/review_record');
  assert.deepEqual(app.setPages.at(-1), { id: 'rist-schema', anchor: 'review_record' });
  app.pageLink('extraction-rules-index', 'csv');
  expectPage(app, 'extraction-rules-index', '01/03');
  assert.equal(app.location.hash, '#extraction-rules-index/csv');
  app.pageButton('extraction-rule-csv-001').click();
  expectPage(app, 'extraction-rule-csv-001', '02/03');
});
