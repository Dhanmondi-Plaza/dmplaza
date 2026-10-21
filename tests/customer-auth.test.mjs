import test from 'node:test';
import assert from 'node:assert/strict';
import {safeReturnTo, normalizePhone} from '../features/customer-auth.ts';

test('return destination stays on this site and cannot loop through account', () => {
  assert.equal(safeReturnTo('/meridian-hill/events?ticket=1'), '/meridian-hill/events?ticket=1');
  for (const value of ['//evil.test', '/\\evil.test', 'https://evil.test', '/account?next=/account', '/foo\nbar']) {
    assert.equal(safeReturnTo(value), null);
  }
});

test('phone input becomes E.164 without accepting ambiguous numbers', () => {
  assert.equal(normalizePhone('(718) 555-0123'), '+17185550123');
  assert.equal(normalizePhone('17185550123'), '+17185550123');
  assert.equal(normalizePhone('+447700900123'), '+447700900123');
  assert.equal(normalizePhone('12345'), null);
});
