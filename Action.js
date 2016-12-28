const HomeControlClient = require('./HomeControlClient');

class Action {
  constructor(action, client) {
    this._client = client;
    this._id = action.id;
    this._name = action.name;
    this._type = action.type;
    this._location = action.location;
    this._value1 = action.value1;

    this._client.on('listactions_event', this._onListActions.bind(this));
  }

  execute() {
    var newValue = 0;
    if (this._value1 == 0) {
      newValue = 100;
    }
    this._client.executeAction(this._id, newValue);
  }

  _onListActions(actions) {
    var action;
    for (action of actions) {
      if (action.id == this._id) {
        this._value1 = action.value1;
        break;
      }
    }
  }

  get id() {
    return this._id;
  }
}

module.exports = Action;
