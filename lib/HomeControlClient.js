'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');
const Action = require('./Action');
const Location = require('./Location');
const Socket = require('./JsonSocket');

const NHC_PORT = 8000;

function HomeControlClient(host) {
  EventEmitter.call(this);

  this.host = host;
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

HomeControlClient.prototype.connect = function() {
  this.socket.connect(NHC_PORT, this.host);
}

HomeControlClient.prototype.listActions = function(callback) {
  var socket = new Socket();
  var self = this;

  socket.connect(NHC_PORT, this.host)

  socket.on('connect', function() {
    var listactions = { cmd: 'listactions' };
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

HomeControlClient.prototype.listLocations = function(callback) {
  var socket = new Socket();
  var self = this;

  socket.connect(NHC_PORT, this.host)

  socket.on('connect', function() {
    var listlocations = { cmd: 'listlocations' };
    socket.write(JSON.stringify(listlocations))
  });

  socket.on('message', function(locations) {
    var parsedLocations = [];
    locations.data.forEach(function(location) {
      parsedLocations.push(new Location(location));
    });

    callback(parsedLocations);
  });
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
