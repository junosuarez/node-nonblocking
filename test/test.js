/* globals describe, it, beforeEach */
var mochi = require('mochi')
var expect = mochi.expect

describe('nonblocking', function () {
  var nonblocking = require('../')

  var arr
  var n
  beforeEach(function () {
    arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    n = nonblocking(arr)
  })

  it('interface', function () {
    expect(nonblocking).to.be.a('function')

    expect(n).to.have.interface({
      filter: Function,
      forEach: Function,
      some: Function,
      every: Function,
      map: Function
    })
  })

  describe('iter', function () {
    it('can stop early', function (done) {
      var max = 0
      nonblocking.iter(1, 100, function (i) {
        max = i
        if (i === 3) {
          return nonblocking.iter.STOP
        }
      }, function () {
        expect(max).to.equal(3)
        done()
      })
    })
    it('traps errors', function (done) {
      function boom () {
        throw new Error('oops')
      }
      nonblocking.iter(1, 100, boom, function (err) {
        expect(err).to.be.instanceof(Error)
        expect(err.message).to.equal('oops')
        done()
      })
    })
    it('throws on error if there is no callback', function () {
      // function boom () {
      //   throw new Error('oops')
      // }

      // I'm not sure how to test for an uncaught exception
      // from within mocha...

      // expect(function () {
        // nonblocking.iter(1, 100, boom)
      // }).to.throw(Error)
    })
    it('does not call the fn if iterating 0 to 0', function (done) {
      nonblocking.iter(0, 0, function () {
        throw new Error('should not be called')
      }, done)
    })
  })

  describe('forEach', function () {
    it('iterates over every item in array', function (done) {
      var i = 0
      var seen = []
      var seenKeys = []
      n.forEach(function (v, k) {
        i++
        seen.push(v)
        seenKeys.push(k)
      }, function (err) {
        expect(i).to.equal(arr.length)
        expect(seen).to.deep.equal(arr)
        expect(seenKeys).to.deep.equal(Object.keys(arr).map(Number))
        done(err)
      })
    })
    it('iterates over every property in an object', function (done) {
      var seen = {}
      var obj = {1: 'one', 2: 'two', 3: 'three'}
      nonblocking(obj).forEach(function (val, key) {
        seen[key] = val
      }, function (err) {
        expect(err).to.equal(undefined)
        expect(seen).to.deep.equal(obj)
        done(err)
      })
    })
    it('does not require a callback', function (done) {
      var i = 0
      var seen = []
      n.forEach(function (e) {
        i++
        seen.push(e)
        check()
      })
      function check () {
        if (i === 10) {
          expect(seen).to.deep.equal(arr)
          done()
        }
      }
    })
    it('does not call the fn on an empty array', function (done) {
      nonblocking.forEach([], function () {
        throw new Error('should not be called')
      }, done)
    })
    it('does not call the fn if object key is deleted', function (done) {
      var obj = {a: 1, b: 2}
      nonblocking.forEach(obj, function () {
        throw new Error('should not be called')
      }, done)
      delete obj.a
      delete obj.b
    })
    it('does not call the fn if array el is deleted', function (done) {
      var obj = ['a', 'b']
      nonblocking.filter(obj, function () {
        throw new Error('should not be called')
      }, done)
      obj.pop()
      obj.pop()
    })
  })

  describe('filter', function () {
    it('returns the same as Array#filter', function (done) {
      function even (i) {
        return i % 2 === 0
      }
      n.filter(even, function (err, out) {
        expect(out)
          .to.deep.equal(arr.filter(even))
        done(err)
      })
    })
    it('can filter an object collection', function (done) {
      function notNullOrUndefined (v, k) {
        return !(v === undefined || v === null)
      }
      var obj = {1: 'one', 2: null, 3: 'three', 4: undefined}
      var expected = {1: 'one', 3: 'three'}
      nonblocking.filter(obj, notNullOrUndefined, function (err, out) {
        expect(out).to.deep.equal(expected)
        done(err)
      })
    })
  })

  describe('some', function () {
    it('returns the same as Array#some', function (done) {
      function gt7 (e) {
        return e > 7
      }
      n.some(gt7, function (err, out) {
        expect(out)
          .to.deep.equal(arr.some(gt7))
        done(err)
      })
    })
  })

  describe('every', function () {
    it('returns the same as Array#every', function (done) {
      function gte0 (e) {
        return e >= 0
      }
      n.every(gte0, function (err, out) {
        expect(out)
          .to.deep.equal(arr.every(gte0))
        done(err)
      })
    })
  })

  describe('map', function () {
    it('returns the same as Array#map', function (done) {
      function x2 (e) {
        return e * 2
      }
      n.map(x2, function (err, out) {
        expect(out)
          .to.deep.equal(arr.map(x2))
        done(err)
      })
    })
  })
})
