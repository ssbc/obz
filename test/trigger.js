var tape = require('tape')

module.exports = function (observable) {

  tape('set listener and trigger', function (t) {
    var o = observable()
    var value = Math.random(), checked = 0
    var rm = o(function (_value) {
      checked ++
      t.equal(_value, value)
    })

    t.equal(checked, 0)
    o.set(value)

    t.equal(checked, 1)

    o.set(value)

    t.equal(checked, 2)
    t.ok(rm)

    rm()

    o.set(Math.random())

    t.equal(checked, 2)
    t.end()
  })

  tape('set value before listener', function (t) {
    var o = observable()

    var value = Math.random(),  checked = 0

    o.set(value)

    var rm = o(function (_value) {
      t.equal(_value, value)
      checked ++
    })

    t.equal(checked, 1)
    t.ok(rm)

    o.set(value)

    t.equal(checked, 2)

    rm()

    o.set(Math.random())

    t.equal(checked, 2)
    t.end()

  })

  tape('add listener within trigger', function (t) {
    var o = observable()

    var value = Math.random(),  checked = 0, checking = false

    o(function (_value) {
      checked ++
      t.equal(_value, value)
      o(function (_value) {
        checked ++
        t.equal(_value, value)
      })
      t.equal(checked, 2)
    })

    o.set(value)

    t.end()
  })

  tape('remove itself, simple', function (t) {
    var o = observable()
    t.plan(1)

    o(function (val) {
      t.equals(val, 10)
      return false
    })

    o.set(10)

    o.set(20)

    t.end()
  })


  tape('remove itself, complex', function (t) {
    var o = observable()
    t.plan(5)

    var remove = o(function (val) {
      t.equals(val, 10)
      return false
    })

    const expected = [10, 20]
    // 2nd listener remains functional after 1st listener is removed
    o(function (val) {
      t.true(expected.length > 0)
      t.equals(val, expected.shift())
    })

    o.set(10)

    remove() // should do nothing

    o.set(20)

    t.end()
  })

  tape('remove itself (immediately)', function (t) {
    var o = observable()

    o.set(10)

    o(function (val) {
      t.equals(val, 10)
      return false
    }, true)

    o.set(20)

    t.end()
  })

  tape('flatten recursion', function (t) {
    var o = observable()

    var value = Math.random(),  checked = 1, checking = false

    function recurse () {
      checking = true
      checked ++
      if(checked < 3)
        o.set(checked)
      checking = false
    }

    var last, last2
    o(function (v) {
      console.log(last, v)
      if(last) t.ok(v > last, 'monotonic increasing listeners')
      last = v
    })
    o(recurse)
    o(function (v) {
      console.log(last2, v)
      if(last2) t.ok(v > last2, 'monotonic increasing listeners')
      last2 = v
    })



    o.set(checked)

    t.equal(checked, 3)
    t.end()
  })

  tape('once', function (t) {
    var o = observable()
    var fired = 0
    o.once(function (v) {
      fired ++
      t.equal(v, 1)
    })

    o.set(1)

    o.once(function (v) {
      fired ++
      t.equal(v, 2)
    }, false)

    o.once(function (v) {
      fired ++
      t.equal(v, 1)
    })

    t.equal(fired, 2)

    o.set(2)

    o.set(3)

    t.equal(fired, 3)

    t.end()
  })

  tape('once, !immediately, inside trigger', function (t) {
    var o = observable()
    var fired = 0
    o.once(function (v) {
      t.equal(v, 1)
      fired ++
      o.once(function (v) {
        fired ++
        t.equal(v, 2)
      }, false)
    })

    o.set(1)
    t.equal(fired, 1)
    o.set(2)
    t.equal(fired, 2)
    t.end()
  })

  tape('bug', (t) => {
    t.plan(4)
    var o = observable()

    var a = o(() => {
      t.pass("first was called")
    })

    o(() => {
      t.pass("second was called")
      // This removes the previous listener, which changes the number of
      // listeners.
      a()
    })


    o(() => {
      t.pass("third was called")
      // `listeners.length` started at 3, but when the above listener removes
      // it reduces the listener count to 2. When Obv tries to run the third
      // listener (this one), it tries `listeners[2](value)`, which throws an
      // error because this listener now has an index of `1`.
    })

    try {
      o.set(42)
      t.pass('did not throw!')
    } catch (e) {
      t.fail(e)
    }
  })

}

if(!module.parent) module.exports (require('../'))

