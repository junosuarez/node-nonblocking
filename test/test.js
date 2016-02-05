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
  })

  describe('forEach', function () {
    it('iterates over every item in array', function (done) {
      var i = 0
      var seen = []
      n.forEach(function (e) {
        i++
        seen.push(e)
      }, function (err) {
        expect(i).to.equal(arr.length)
        expect(seen).to.deep.equal(arr)
        done(err)
      })
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
