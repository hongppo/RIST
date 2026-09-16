const test = require('node:test');
const assert = require('node:assert/strict');
const math = require('../assets/canvas-math.js');

test('width fit preserves readable width regardless of page height', () => {
  assert.equal(math.widthFit(704, 1280), .5);
  assert.equal(math.widthFit(1600, 1280), 1);
  assert.equal(math.widthFit(192, 1280), .1);
});

test('zoom limits include narrow-window fit without a jump to 25 percent', () => {
  assert.equal(math.clampZoom(.12), .12);
  assert.equal(math.clampZoom(.01), .1);
  assert.equal(math.clampZoom(2.5), 2);
  assert.equal(math.clampZoom(NaN), 1);
});

test('zoom keeps the same document point under the pointer', () => {
  const before = { left: 200, top: -400 };
  const after = { left: 150, top: -400 };
  const anchor = { clientX: 500, clientY: 300 };
  const oldZoom = .5, newZoom = .8;
  const change = math.anchorAdjustment(before, after, anchor, oldZoom, newZoom);
  assert.equal(after.left - change.left + (anchor.clientX - before.left) / oldZoom * newZoom, anchor.clientX);
  assert.equal(after.top - change.top + (anchor.clientY - before.top) / oldZoom * newZoom, anchor.clientY);
});

test('a long-page width refit retains the content at the viewport top', () => {
  const anchor = { clientX: 500, clientY: 200 };
  const before = { left: 180, top: -342 };
  const after = { left: 180, top: -342 };
  const adjustment = math.anchorAdjustment(before, after, anchor, .5, .75);
  assert.equal(adjustment.top, 271);
  const newScrollTop = 600 + adjustment.top;
  assert.equal(258 + 1084 * .75 - newScrollTop, 200);
});

test('wheel pixel, line and page units use the visible viewport dimensions', () => {
  assert.deepEqual(math.scrollDelta({ deltaX: 2, deltaY: 3, deltaMode: 0 }, 700, 600), { left: 2, top: 3 });
  assert.deepEqual(math.scrollDelta({ deltaX: 2, deltaY: 3, deltaMode: 1 }, 700, 600), { left: 32, top: 48 });
  assert.deepEqual(math.scrollDelta({ deltaX: 1, deltaY: -1, deltaMode: 2 }, 700, 600), { left: 700, top: -600 });
});
