const Socket = require('net').Socket;
const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');

class HomeControlClient extends EventEmitter {
  constructor() {
    super();

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
      this._handleLine(this._buffer);
      this._buffer = '';
    }
  }

  _onConnect() {
    this._closed = false;

    // Load current state of the Home Control installation
    this._socket.write('{"cmd": "listactions"}');
    this._socket.write('{"cmd": "listlocations"}');

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

    switch(object.cmd) {
      case 'listactions':
        this._parseActions(object.data);
        break;
      case 'listlocations':
        this._parseLocations(object.data);
        break;
      case 'event':
        this._parseEvent(object.data);
      default:
        break;
    }
  }

  _parseActions(actions) {
    console.log(actions);
  }

  _parseLocations(locations) {
    console.log(locations);
  }

  _parseEvent(event) {
    console.log(event);
  }

  connect(port, host) {
    this._socket.connect(port, host);
  }
}

module.exports = HomeControlClient;
