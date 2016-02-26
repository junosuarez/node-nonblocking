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

function iter (i, limit, fn, end, stop) {
  stop = stop || false
  var err = {}
  setImmediate(function () {
    if (stop || i >= limit) {
      if (typeof end === 'function') {
        end()
      }
      return
    }

    // yield i, increment i, and check for stop
    stop = iter.STOP === tryFn1(fn, i++, err)
    if (err.err) {
      if (end) {
        return end(err.err)
      } else {
        // in new call stack, will not be caught
        throw err.err
      }
    }

    iter(i, limit, fn, end, stop)
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
  var isArray = Array.isArray(arr)
  var out = isArray ? [] : {}
  forEach(arr, function (v, k) {
    if (fn(v, k)) {
      if (isArray) {
        out.push(v)
      } else {
        out[k] = v
      }
    }
  }, function (err) {
    cb(err, out)
  })
}

function forEach (arr, fn, cb) {
  if (Array.isArray(arr)) {
    iter(0, arr.length, function (i) {
      if (i in arr) {
        fn(arr[i], i)
      }
    }, cb)
  } else {
    var keys = Object.keys(arr)
    iter(0, keys.length, function (i) {
      var k = keys[i]
      if (k in arr) {
        fn(arr[k], k)
      }
    }, cb)
  }
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
