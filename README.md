# babel-plugin-multidimensional-array

Fast multidimensional typed arrays with a nice syntax.

Typed arrays are awesome, but sometimes you want a multidimensional array.
You can do it with arrays of (arrays of...) typed arrays, but accessing
or writing data to nested array objects is slow.

One way to fix this is by using a single flattened typed array, and hand
calculating the offset where the data is for every access. But that is tedious.
This babel plugin takes care of it for you. Just define your local variables or
function arguments with dimensions, and accesses will be transformed to compute
the correct offset.

## Example

Compiles this:

```javascript
let x[2][3] = new Uint8Array([1,2,3,4,5,6]);
x[1][2] = 42;
```

into:

```javascript
let x = new Uint8Array([1,2,3,4,5,6]);
x[5] = 42;
```

Function arguments are also supported, as are non-constant dimensions:

```javascript
function test(x[a][b], y) {
  x[1][y] = 4;
}
```

compiles to:

```javascript
function test(x, y) {
  x[y + b * 1] = 4;
}
```

Subarrays are also supported, if you access only one of the dimensions:

```javascript
let y[2][3][4] = new Uint8Array(2 * 3 * 4);
console.log(y[1]);
```

compiles to:

```javascript
let y = new Uint8Array(2 * 3 * 4);
console.log(y.subarray(12, 24));
```

## Licence

MIT
