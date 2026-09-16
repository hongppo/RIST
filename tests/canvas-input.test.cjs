const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/canvas-input.js'), 'utf8');
function setup() {
  class Node {
    constructor() { this.listeners = {}; this.classes = new Set(); this.classList = { toggle: (key, on) => on ? this.classes.add(key) : this.classes.delete(key) }; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter((entry) => entry !== fn); }
    fire(type, props = {}) { const event = { target: surface, ...props, prevented: false, preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } }; for (const fn of this.listeners[type] || []) fn(event); return event; }
    contains(node) { return node === this || node === child; }
    closest(selector) { return this.isEditable || (this.isControl && selector.includes('button')) ? this : null; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 800 }; }
    setPointerCapture(id) { this.pointer = id; }
    hasPointerCapture(id) { return id === this.pointer; }
    releasePointerCapture() { this.pointer = null; }
  }
  const win = new Node();
  const doc = new Node();
  const surface = new Node();
  const child = new Node();
  doc.defaultView = win; doc.activeElement = surface; surface.ownerDocument = doc;
  const sandbox = { window: {}, Date, Number, Math, Object, Boolean };
  vm.runInNewContext(source, sandbox);
  // Re-evaluate only the serialized function to detect external closure dependencies.
  const bind = vm.runInNewContext('(' + sandbox.window.MockupCanvasInput.toString() + ')', { Date, Number, Math, Object, Boolean });
  const messages = [], spaces = [];
  let blocked = false;
  const api = bind(surface, (input) => messages.push(JSON.parse(JSON.stringify(input))), { isBlocked: () => blocked, onSpaceChange: (active) => spaces.push(active) });
  return { win, doc, surface, child, api, messages, spaces, block: (value) => blocked = value };
}

test('wheel is canvas-local, pinch zooms and ordinary wheel scrolls', () => {
  const s = setup();
  const pinch = s.surface.fire('wheel', { ctrlKey: true, deltaY: -20, deltaX: 0, deltaMode: 0, clientX: 250, clientY: 300 });
  assert.equal(pinch.prevented, true);
  assert.equal(s.messages[0].kind, 'zoom');
  assert.ok(s.messages[0].factor > 1);
  assert.equal(s.messages[0].clientX, 250);
  const scroll = s.surface.fire('wheel', { deltaX: 5, deltaY: 90, deltaMode: 1 });
  assert.equal(scroll.prevented, true);
  assert.deepEqual(s.messages.at(-1), { kind: 'scroll', deltaX: 5, deltaY: 90, deltaMode: 1 });
  s.child.isEditable = true;
  assert.equal(s.surface.fire('wheel', { target: s.child, deltaX: 0, deltaY: 90 }).prevented, false);
  s.block(true);
  assert.equal(s.surface.fire('wheel', { ctrlKey: true, deltaY: -10 }).prevented, true);
});

test('Safari gestures are incremental and suppress duplicate wheel zoom', () => {
  const s = setup();
  s.surface.fire('pointerenter', { clientX: 350, clientY: 240 });
  s.surface.fire('gesturestart', { scale: 1 });
  s.surface.fire('gesturechange', { scale: 1.5, clientX: 50, clientY: 60 });
  s.surface.fire('wheel', { ctrlKey: true, deltaY: -10 });
  s.surface.fire('gesturechange', { scale: 1.8 });
  assert.equal(s.messages.length, 2);
  assert.equal(s.messages[0].factor, 1.5);
  assert.equal(s.messages[1].factor, 1.2);
  assert.equal(s.messages[1].clientX, 50);
  assert.equal(s.messages[1].clientY, 60);
  s.surface.fire('gestureend', {});
  s.surface.fire('wheel', { ctrlKey: true, deltaY: -10 });
  assert.equal(s.messages.length, 2);
});

test('normal selection is untouched; Space pans by stable screen-coordinate deltas', () => {
  const s = setup();
  assert.equal(s.surface.fire('pointerdown', { button: 0, pointerId: 1 }).prevented, false);
  s.doc.activeElement = {}; // Pointer over the canvas works even with focus elsewhere.
  s.surface.fire('pointerenter');
  const key = s.doc.fire('keydown', { code: 'Space' });
  assert.equal(key.prevented, true);
  assert.equal(s.surface.classes.has('is-pan-ready'), true);
  s.surface.fire('pointerdown', { button: 0, pointerId: 3, screenX: 300, screenY: 200 });
  s.surface.fire('pointermove', { pointerId: 3, screenX: 320, screenY: 150, clientX: 900, clientY: 700 });
  assert.deepEqual(s.messages, [{ kind: 'pan-start' }, { kind: 'pan', deltaX: 20, deltaY: -50 }]);
  s.doc.fire('keyup', { code: 'Space' });
  assert.equal(s.messages.at(-1).kind, 'pan-end');
  assert.equal(s.surface.classes.has('is-panning'), false);
  assert.deepEqual(s.spaces, [true, false]);
});

test('controls keep Space behavior; frame focus transfer preserves Space; cancellation cleans up', () => {
  const s = setup();
  s.child.isControl = true;
  s.doc.activeElement = s.child;
  assert.equal(s.doc.fire('keydown', { code: 'Space', target: s.child }).prevented, false);
  s.child.isControl = false;
  s.api.setSpace(true);
  s.child.tagName = 'IFRAME';
  s.win.fire('blur');
  assert.equal(s.surface.classes.has('is-pan-ready'), true);
  s.surface.fire('pointerdown', { button: 0, pointerId: 2, screenX: 0, screenY: 0 });
  s.surface.fire('pointercancel', { pointerId: 2 });
  assert.equal(s.surface.classes.has('is-pan-ready'), false);
  assert.equal(s.messages.at(-1).kind, 'pan-end');
  s.api.setSpace(true);
  s.doc.activeElement = {};
  s.win.fire('blur');
  assert.equal(s.surface.classes.has('is-pan-ready'), false);
  s.api.destroy();
  const count = s.messages.length;
  s.surface.fire('wheel', { ctrlKey: true, deltaY: -10 });
  assert.equal(s.messages.length, count);
});


test('blocked picking still suppresses browser pinch without emitting canvas zoom', () => {
  const s = setup();
  s.block(true);
  assert.equal(s.surface.fire('wheel', { ctrlKey: true, deltaY: -40 }).prevented, true);
  assert.equal(s.surface.fire('gesturestart', { scale: 1 }).prevented, true);
  assert.equal(s.surface.fire('gesturechange', { scale: 2 }).prevented, true);
  assert.equal(s.surface.fire('gestureend').prevented, true);
  assert.deepEqual(s.messages, []);
});

test('hovering canvas permits Space after toolbar focus while editor focus and outside buttons remain native', () => {
  const s = setup();
  s.child.isControl = true;
  s.doc.activeElement = s.child;
  assert.equal(s.doc.fire('keydown', { code: 'Space', target: s.child }).prevented, false);
  s.surface.fire('pointerenter');
  assert.equal(s.doc.fire('keydown', { code: 'Space', target: s.child }).prevented, true);
  assert.equal(s.surface.classes.has('is-pan-ready'), true);
  s.doc.fire('keyup', { code: 'Space', target: s.child });
  s.child.isEditable = true;
  assert.equal(s.doc.fire('keydown', { code: 'Space', target: s.child }).prevented, false);
  assert.equal(s.surface.classes.has('is-pan-ready'), false);
  s.child.isEditable = false;
  s.surface.fire('pointerleave');
  assert.equal(s.doc.fire('keydown', { code: 'Space', target: s.child }).prevented, false);
});


test('internal mockup panels keep wheel scrolling while pinch and Space remain canvas controls', () => {
  const s = setup();
  const region = { closest: selector => selector === '[data-viewer-scroll-region]' ? region : null };
  const wheel = s.surface.fire('wheel', { target: region, deltaX: 0, deltaY: 90 });
  assert.equal(wheel.prevented, false);
  assert.equal(s.messages.length, 0);
  const pinch = s.surface.fire('wheel', { target: region, ctrlKey: true, deltaY: -10, clientX: 20, clientY: 30 });
  assert.equal(pinch.prevented, true);
  assert.equal(s.messages.at(-1).kind, 'zoom');
  s.api.setSpace(true);
  const pan = s.surface.fire('wheel', { target: region, deltaX: 0, deltaY: 90 });
  assert.equal(pan.prevented, true);
  assert.equal(s.messages.at(-1).kind, 'scroll');
});
