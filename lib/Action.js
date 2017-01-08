'use strict';

const EventEmitter = require('events');

function Action(action, location, client) {
    EventEmitter.call(this);

    this.action = action;
    this.location = location;
    this.client = client;

    this.client.on('listactions', this.onListActions.bind(this));
}

Action.prototype = Object.create(EventEmitter.prototype);
Action.prototype.constructor = Action;

Object.defineProperty(Action.prototype, 'id', {
  get: function() {
    return this.action.id;
  }
});

Object.defineProperty(Action.prototype, 'name', {
  get: function() {
    return this.action.name;
  }
});

Object.defineProperty(Action.prototype, 'type', {
  get: function() {
    return this.action.type;
  }
});

Object.defineProperty(Action.prototype, 'value1', {
  get: function() {
    return this.action.value1;
  },
  set: function(value) {
    this.action.value1 = value;
  }
});

Action.prototype.execute = function() {
  this.client.executeAction(this);
}

Action.prototype.onListActions = function(actions) {
  var action;
  for (action of actions) {
    if (action.id == this.id) {
      this.value1 = action.value1;
      this.emit('update', this.value1);
      break;
    }
  }
}

module.exports = Action;
