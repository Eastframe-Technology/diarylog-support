// Run with: node tools/diary-card.test.js
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const C = require('./diary-card.js');

let count = 0;
function test(name, fn) { fn(); count++; console.log('ok  ' + name); }

// The vectors from DiaryLog's test/logic_test.dart, 'week start follows the
// chosen first weekday'. 4 Nov 2026 is a Wednesday (weekday 3).
test('app vectors: week start', () => {
  assert.strictEqual(C.offset(3, 1), 2); // Monday 2 Nov
  assert.strictEqual(C.offset(3, 7), 3); // Sunday 1 Nov
  assert.strictEqual(C.offset(3, 6), 4); // Saturday 31 Oct
  assert.strictEqual(C.offset(1, 1), 0); // Monday 2 Nov is its own week start
});

test('day order places each weekday at the app\'s offset', () => {
  for (let first = 1; first <= 7; first++) {
    const order = C.dayOrder(first);
    assert.strictEqual(new Set(order).size, 7);
    assert.strictEqual(order[0], C.DAYS[first - 1]);
    for (let weekday = 1; weekday <= 7; weekday++) {
      assert.strictEqual(order.indexOf(C.DAYS[weekday - 1]), C.offset(weekday, first));
    }
  }
});

test('day order: bad input falls back to Monday', () => {
  for (const bad of [0, 8, 2.5, 'x', undefined, null]) assert.strictEqual(C.dayOrder(bad)[0], 'Monday');
  assert.strictEqual(C.dayOrder('7')[0], 'Sunday');
});

const html = fs.readFileSync(path.join(__dirname, 'printable-dbt-diary-card.html'), 'utf8');
const sheet = html.slice(html.indexOf('id="card"'), html.indexOf('</section>', html.indexOf('id="card"')));

test('the card has what the app tracks', () => {
  const items = ['Self-harm urges', 'Suicidal thoughts', 'Urge to use (alcohol, drugs)', 'Acted',
    'Joy', 'Sadness', 'Anger', 'Fear', 'Shame', 'Guilt',
    'Mindfulness', 'Distress tolerance', 'Emotion regulation', 'Interpersonal effectiveness',
    'Skills use', 'Medication', 'Note'];
  for (const item of items) assert.ok(sheet.includes(item), 'missing ' + item);
});

test('seven day rows, each with one cell per column', () => {
  const body = sheet.slice(sheet.indexOf('<tbody'), sheet.indexOf('</tbody>'));
  const rows = body.split('<tr').slice(1);
  assert.strictEqual(rows.length, 7);
  const cols = (sheet.match(/<col[ >]/g) || []).length;
  assert.strictEqual(cols, 23);
  rows.forEach((r) => assert.strictEqual((r.match(/<t[hd][ >]/g) || []).length, cols));
  C.DAYS.forEach((d, i) => assert.ok(rows[i].includes('>' + d + '<'), d));
});

test('the printed card carries the crisis note', () => {
  assert.ok(/not a crisis service/i.test(sheet));
  assert.ok(sheet.includes('local emergency number'));
  assert.ok(sheet.includes('988'));
});

test('nothing is stored or sent', () => {
  const js = html + fs.readFileSync(path.join(__dirname, 'diary-card.js'), 'utf8');
  for (const api of ['localStorage', 'sessionStorage', 'indexedDB', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', '<form', 'type="text"', '<textarea']) {
    assert.ok(!js.includes(api), 'found ' + api);
  }
});

console.log(`\n${count} tests passed`);
