# nonblocking
Array.prototype functions that won't block on large arrays

[![js standard style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)]()

[![build status](https://circleci.com/gh/jden/node-nonblocking.svg?&style=shield)][circleci]

[circleci]: https://circleci.com/gh/jden/node-nonblocking
[standard]: http://standardjs.com/

## usage
```js
var nonblocking = require('nonblocking')

var bigArray = []
for (var i; i < 10000000; i++) {
  bigArray.push(i)
}

nonblocking(bigArray).forEach(function (el) {
  console.log(el)
}, function (err) {
  console.log('all done!')
})

```

When iterating over large arrays, even simple functions
may become blocking. In a browser, this might mean an
slow, "janky" page. In Node.js, this might mean a
completely non-responsive web server!

Use this module to fan out over a large array. Note
that the functions being applied to each element are
not treated asynchronously or in parallel, so it's
not suited to file system or network IO. If that's
what you want, consider the popular [`async`][1] module.

Measure before optimizing! You can use the [`event-loop-lag`][2] module to measure if you have anything blocking in your Node.js process. If those numbers start
to rise, `nonblocking` might help you!

[1]: https://www.npmjs.com/package/async
[2]: https://www.npmjs.com/package/event-loop-lag


## api

In brief, call any of `filter`, `forEach`, `some`, `every`, or `map`, passing the array as the first arugment, and a Node.js-style callback as the last.

The methods are also available in a fluent syntax like lodash or underscore. Use whichever one you prefer.

Using [jsig](https://github.com/jsigbiz/spec) annotation.

### `forEach(arr: Array, fn: Function) => Callback<>`

The final callback parameter is optional.

e.g.
```js
nonblocking.forEach([1, 2, 3], function (x) {
  console.log(x)
}, function (err) {
  // logged: 1\n2\n3
})

// or 

nonblocking([1, 2, 3]).forEach(function (x) {
  console.log(x)
}, function (err) {
  // logged: 1\n2\n3
})
```


### `filter(arr: Array, fn: Predicate) => Callback<Array>`

e.g.
```js
nonblocking.filter([1, 2, 3], function (x) { return x >= 2 }, function (err, out) {
  // out = [2, 3]
})

// or 

nonblocking([1, 2, 3]).filter(function (x) { return x >= 2 }, function (err, out) {
  // out = [2, 3]
})
```


### `map(arr: Array, fn: Function) => Callback<Array>`

e.g.
```js
nonblocking.map([1, 2, 3], function (x) { return x + 1 }, function (err, out) {
  // out = [2, 3, 4]
})

// or 

nonblocking([1, 2, 3]).map(function (x) { return x + 1 }, function (err, out) {
  // out = [2, 3, 4]
})
```


### `some(arr: Array, fn: Predicate) => Callback<Boolean>`

e.g.
```js
nonblocking.some([1, 2, 3], function (x) { return x < 0 }, function (err, out) {
  // out = false
})

// or 

nonblocking([1, 2, 3]).some(function (x) { return x < 0 }, function (err, out) {
  // out = false
})
```


### `every(arr: Array, fn: Predicate) => Callback<Boolean>`

e.g.
```js
nonblocking.every([1, 2, 3], function (x) { return x > 0 }, function (err, out) {
  // out = true
})

// or 

nonblocking([1, 2, 3]).every(function (x) { return x > 0 }, function (err, out) {
  // out = true
})
```


## installation

    $ npm install nonblocking


## running the tests

From package root:

    $ npm install
    $ npm test


## contributors

- jden <jason@denizac.org>


## license

ISC. (c) MMXVI jden <me@jden.us>. See LICENSE.md
