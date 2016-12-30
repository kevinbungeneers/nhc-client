'use strict';

const Socket = require('net').Socket;
const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');

const Action = require('./Action');

function HomeControlClient() {
  EventEmitter.call(this);

  this.socket = new Socket();
  this.decoder = new StringDecoder('utf8');
  this.buffer = '';

  this.socket.on('data', this.onData.bind(this));
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('close', this.onClose.bind(this));
  this.socket.on('err', this.onError.bind(this));
}

HomeControlClient.prototype = Object.create(EventEmitter.prototype);
HomeControlClient.prototype.constructor = HomeControlClient;

HomeControlClient.prototype.onData = function(data) {
  this.buffer += this.decoder.write(data);
  if(this.buffer.indexOf("\n") > -1) {
    this.buffer.trim();
    var parts = this.buffer.trim().split("\n");

    for (var i = 0; i < parts.length; i++) {
      this.handleLine(parts[i]);
    }
    this.buffer = '';
  }
}

HomeControlClient.prototype.onConnect = function() {
  // TODO
}

HomeControlClient.prototype.onClose = function() {
  // TODO
}

HomeControlClient.prototype.onError = function() {
  // TODO
}

HomeControlClient.prototype.handleLine = function(data) {
  var object = JSON.parse(data);
  if (object.hasOwnProperty("cmd")) {
    var parsedData;
    switch (object.cmd) {
      case 'listactions':
        parsedData = this.parseActions(object.data);
        break;
      case 'listlocations':
        parsedData = this.parseLocations(object.data);
        break;
      default:
        break;
    }
    this.emit(object.cmd + '_cmd', parsedData);
  } else if (object.hasOwnProperty("event")) {
    this.emit(object.event + '_event', object.data);
  }
}

HomeControlClient.prototype.parseActions = function(actions) {
  var parsedActions = [];

    this.setMaxListeners(actions.length);

    var action;
    for (action of actions) {
      parsedActions.push(new Action(action, this));
    }

    return parsedActions;
}

HomeControlClient.prototype.parseLocations = function(locations) {
  // TODO
}

HomeControlClient.prototype.executeCommand = function(command) {
  this.socket.write('{"cmd": "' + command + '" }');
}

HomeControlClient.prototype.connect = function(port, host) {
  this.socket.connect(port, host);
}

HomeControlClient.prototype.listActions = function() {
  this.executeCommand("listactions");
}

HomeControlClient.prototype.listLocations = function() {
  this.executeCommand("listlocations");
}

HomeControlClient.prototype.startEvents = function() {
  this.executeCommand('startevents');
}

HomeControlClient.prototype.executeAction = function(action) {
  this.socket.write('{"cmd": "executeactions", "id": ' + action.id + ', "value1": ' + action.value1 + '}');
}

module.exports = HomeControlClient;
