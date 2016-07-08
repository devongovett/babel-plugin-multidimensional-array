import assert from 'assert';
import {transformFileSync, transform} from 'babel-core';
import fs from 'fs';

describe('babel-plugin-multidimensional-array', function() {
  it('should transform array accesses', function() {
    let transformed = transformFileSync(__dirname + '/fixtures/in.js', {
      plugins: [__dirname + '/../src']
    });
    
    assert.equal(transformed.code, fs.readFileSync(__dirname + '/fixtures/out.js', 'utf8'));
  });
  
  it('should error when too many dimensions are specified', function() {
    assert.throws(function() {
      let transformed = transform('let a[2][2] = [1,2,3,4]; a[1][1][1] = 4;', {
        plugins: [__dirname + '/../src']
      });
    }, /Too many dimensions specified. Got 3, expected 2./);
  });
});
