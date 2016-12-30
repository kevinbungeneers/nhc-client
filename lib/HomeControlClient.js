'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');

const Action = require('./Action');
const Socket = require('./JsonSocket');

const NHC_PORT = 8000;

function HomeControlClient() {
  EventEmitter.call(this);

  this.socket = new Socket();
  this.socket.on('message', this.onMessage.bind(this));
  this.socket.on('connect', this.onConnect.bind(this));
}

HomeControlClient.prototype = Object.create(EventEmitter.prototype);
HomeControlClient.prototype.constructor = HomeControlClient;

HomeControlClient.prototype.onConnect = function() {
  this.executeCommand('startevents');
}

HomeControlClient.prototype.onMessage = function(json) {
  if (json.hasOwnProperty('event')) {
    this.emit(json.event, json.data);
  }
}

HomeControlClient.prototype.executeCommand = function(command) {
  var cmd = { cmd: command };
  this.socket.write(JSON.stringify(cmd));
}

HomeControlClient.prototype.connect = function(host) {
  this.socket.connect(NHC_PORT, host);
}

HomeControlClient.prototype.listActions = function(callback) {
  var socket = new Socket();
  var listactions = { cmd: 'listactions' };
  var self = this;

  socket.connect(NHC_PORT, "192.168.0.226")

  socket.on('connect', function() {
    socket.write(JSON.stringify(listactions))
  });

  socket.on('message', function(actions) {
    self.setMaxListeners(actions.data.length);

    var parsedActions = [];
    actions.data.forEach(function(action) {
      parsedActions.push(new Action(action, self));
    });

    callback(parsedActions);
  });
}

HomeControlClient.prototype.listLocations = function() {
  this.executeCommand('listlocations');
}

HomeControlClient.prototype.executeAction = function(id, value) {
  var act = {
    cmd: 'executeactions',
    id: id,
    value1: value
  };

  this.socket.write(JSON.stringify(act));
}

module.exports = HomeControlClient;
