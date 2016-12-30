const HomeControlClient = require('./HomeControlClient');

function Action(action, client) {
    this.id = action.id;
    this.name = action.name;
    this.type = action.type;
    this.location = action.location;
    this.value1 = action.value1;

    this.client = client;

    this.client.on('listactions_event', this.onListActions.bind(this));
}

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
