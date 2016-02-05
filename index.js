function nonblocking (arr) {
  function bind (f) {
    return function (fn, cb) {
      return f(arr, fn, cb)
    }
  }

  return {
    filter: bind(filter),
    forEach: bind(forEach),
    some: bind(some),
    every: bind(every),
    map: bind(map)
  }
}

function iter (i, limit, fn, end) {
  var stop = false
  var err = {}
  setImmediate(function () {
    // yield i, increment i, and check for stop
    stop = iter.STOP === tryFn1(fn, i++, err)
    if (err.err) {
      return end(err.err)
    }
    if (!stop && i < limit) {
      iter(i, limit, fn, end)
    } else if (typeof end === 'function') {
      setImmediate(end)
    }
  })
}
iter.STOP = Object.create(null)

// minimal try/catch to prevent deopts
// see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#2-unsupported-syntax
function tryFn1 (fn, arg, err) {
  try {
    err.err = null
    return fn(arg)
  } catch (e) {
    err.err = e
  }
}

function filter (arr, fn, cb) {
  var out = []
  forEach(arr, function (e) {
    if (fn(e)) {
      out.push(e)
    }
  }, function (err) {
    cb(err, out)
  })
}

function forEach (arr, fn, cb) {
  iter(0, arr.length, function (i) {
    fn(arr[i])
  }, cb)
}

function some (arr, fn, cb) {
  var out = false
  iter(0, arr.length, function (i) {
    if (fn(arr[i])) {
      out = true
      return iter.STOP
    }
  }, function (err) {
    cb(err, out)
  })
}

function every (arr, fn, cb) {
  var out = true
  iter(0, arr.length, function (i) {
    if (!fn(arr[i])) {
      out = false
      return iter.STOP
    }
  }, function (err) {
    cb(err, out)
  })
}

function map (arr, fn, cb) {
  var out = []
  iter(0, arr.length, function (i) {
    out[i] = fn(arr[i])
  }, function (err) {
    cb(err, out)
  })
}

module.exports = nonblocking
module.exports.iter = iter
module.exports.filter = filter
module.exports.forEach = forEach
module.exports.some = some
module.exports.every = every
module.exports.map = map
