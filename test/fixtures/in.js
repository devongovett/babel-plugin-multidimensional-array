let x[2][3] = new Uint8Array([1,2,3,4,5,6]);
x[1][2] = 42;

let y[2][3][4] = new Uint8Array(2 * 3 * 4);
y[1][2][3] = 57;
y[a][b][c] = d;

console.log(y[1]);

let a = [1, 2, 3];
a[1] = 4;

function test(z[2][3][4], w) {
  z[1][2][3] = w;
}

test(y);
