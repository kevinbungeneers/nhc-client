const Socket = require('net').Socket;
const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');

const Action = require('./Action');

class HomeControlClient extends EventEmitter {
  constructor() {
    super();

    this._port = 0;
    this._host = '';
    this._socket = new Socket();
    this._decoder = new StringDecoder('utf8');
    this._buffer = '';
    this._closed = false;

    this._actions = [];
    this._locations = [];

    this._socket.on('data', this._onData.bind(this));
    this._socket.on('connect', this._onConnect.bind(this));
    this._socket.on('close', this._onClose.bind(this));
    this._socket.on('err', this._onError.bind(this));
  }

  _onData(data) {
    this._buffer += this._decoder.write(data);
    if(this._buffer.indexOf("\n") > -1) {
      this._buffer.trim();
      var parts = this._buffer.trim().split("\n");
      
      for (var i = 0; i < parts.length; i++) {
        this._handleLine(parts[i]);
      }
      this._buffer = '';
    }
  }

  _onConnect() {
    this._closed = false;
    this.startEvents();

    this.emit('connect');
  }

  _onClose() {
    this._closed = true;
  }

  _onError() {
    this._closed = true;
    console.log("Error!");
  }

  _handleLine(data) {
    var object = JSON.parse(data);
    if (object.hasOwnProperty("cmd")) {
      var parsedData;
      switch (object.cmd) {
        case 'listactions':
          parsedData = this._parseActions(object.data);
          break;
        case 'listlocations':
          parsedData = this._parseLocations(object.data);
          break;
        default:
          break;
      }
      this.emit(object.cmd + '_cmd', parsedData);
    } else if (object.hasOwnProperty("event")) {
      this.emit(object.event + '_event', object.data);
    }
  }

  _executeCommand(command) {
    this._socket.write('{"cmd": "' + command + '" }')
  }

  _parseActions(actions) {
    var parsedActions = [];

    this.setMaxListeners(actions.length);

    var action;
    for (action of actions) {
      parsedActions.push(new Action(action, this));
    }

    return parsedActions;
  }

  _parseLocations(locations) {

  }

  connect(port, host) {
    this._port = port;
    this._host = host;
    this._socket.connect(port, host);
  }

  listLocations(callback) {
    this._executeCommand("listlocations");
  }

  listActions() {
    this._executeCommand("listactions");
  }

  startEvents() {
    this._executeCommand('startevents');
  }

  executeAction(id, value) {
    this._socket.write('{"cmd": "executeactions", "id": ' + id + ', "value1": ' + value + '}');
  }
}

module.exports = HomeControlClient;
