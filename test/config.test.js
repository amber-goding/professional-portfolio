import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PORT, parsePort } from '../src/config.js';

describe('parsePort', () => {
  it('uses the local default when PORT is unset or blank', () => {
    assert.equal(parsePort(undefined), DEFAULT_PORT);
    assert.equal(parsePort(''), DEFAULT_PORT);
    assert.equal(parsePort('   '), DEFAULT_PORT);
  });

  it('accepts valid port numbers', () => {
    assert.equal(parsePort('8080'), 8080);
    assert.equal(parsePort(' 4000 '), 4000);
    assert.equal(parsePort('1'), 1);
    assert.equal(parsePort('65535'), 65535);
  });

  for (const bad of ['0', '65536', '-1', '3000.5', '1e3', 'abc', '30 00', '0x1F90']) {
    it(`rejects ${JSON.stringify(bad)} with a message that leaves out the value`, () => {
      assert.throws(
        () => parsePort(bad),
        (error) => {
          assert.equal(error.message, 'Invalid PORT: expected a whole number from 1 to 65535.');
          return true;
        },
      );
    });
  }
});
