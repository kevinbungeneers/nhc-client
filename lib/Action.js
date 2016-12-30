'use strict';

function Action(action, client) {
    this.action = action;
    this.client = client;

    this.client.on('listactions', this.onListActions.bind(this));
}

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

Object.defineProperty(Action.prototype, 'location', {
  get: function() {
    return this.action.location;
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
  if (this.value1 == 0) {
    this.value1 = 100;
  } else {
    this.value1 = 0
  }

  this.client.executeAction(this);
}

Action.prototype.onListActions = function(actions) {
  var action;
  for (action of actions) {
    if (action.id == this._id) {
      this.value1 = action.value1;
      break;
    }
  }
}

module.exports = Action;