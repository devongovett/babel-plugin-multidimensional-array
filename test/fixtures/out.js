"use strict";

var x = new Uint8Array([1, 2, 3, 4, 5, 6]);
x[5] = 42;

var y = new Uint8Array(2 * 3 * 4);
y[23] = 57;
y[c + 4 * (b + 3 * a)] = d;

console.log(y.subarray(12, 24));

var a = [1, 2, 3];
a[1] = 4;

function test(z, w) {
  z[23] = w;
}

test(y);