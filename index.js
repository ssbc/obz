
module.exports = function (filter) {
  var value = null, listeners = [], oncers = []
  function trigger (_value) {
    value = _value
    var length = listeners.length
    for(var i = 0; i< length && value === _value; i++) {
      var listener = listeners[i](value)
      //if we remove a listener, must decrement i also
    }
    while(oncers.length) oncers.shift()(value)
  }

  function many (ready, immediately) {
    var i = listeners.push(ready) - 1
    if(value !== null && immediately !== false) ready(value)
    return function () { //manually remove...
      //fast path, will happen if an earlier listener has not been removed.
      if(listeners[i] !== ready)
        i = listeners.indexOf(ready)
      listeners.splice(i, 1)
    }
  }

  many.set = function (_value) {
    if(filter ? filter(value, _value) : true) trigger(many.value = _value)
    return many
  }

  many.once = function (once, immediately) {
    if(value !== null && immediately !== false) once(value)
    else oncers.push(once)
  }

  return many
}



