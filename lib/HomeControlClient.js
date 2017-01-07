'use strict';

const EventEmitter = require('events');
const Action = require('./Action');
const Location = require('./Location');
const Socket = require('./JsonSocket');
const DiscoveryService = require('./util/DiscoveryService');

const NHC_PORT = 8000;
const NHC_KEEP_ALIVE_TIMEOUT = 12000;

function HomeControlClient() {
  EventEmitter.call(this);
  this.discoveryService = new DiscoveryService();
  this.host = undefined;
}

HomeControlClient.prototype = Object.create(EventEmitter.prototype);
HomeControlClient.prototype.constructor = HomeControlClient;

HomeControlClient.prototype.connect = function() {
  this.discoveryService.on('discover', (host) => {
    this.host = host;

    // Start eventlistener
    var json = { cmd: 'startevents' }
    var onMessage = (message, socket) => {
      if (message.hasOwnProperty('event')) {
        this.emit(message.event, message.data);
      }
    }
    this.execute(json, onMessage, true);

    this.emit('connect');
  });

  this.discoveryService.discover();
}

HomeControlClient.prototype.close = function() {
  this.emit('close');
}

HomeControlClient.prototype.execute = function(json, onMessage, keepAlive) {
  var socket = new Socket();

  if (keepAlive === true) {
    socket.setKeepAlive(true, NHC_KEEP_ALIVE_TIMEOUT);
  }

  socket.on('connect', () => {
    socket.write(json);
  });

  this.on('close', function() {
    socket.destroy();
  });

  socket.on('message', onMessage);
  socket.connect(NHC_PORT, this.host);
}

HomeControlClient.prototype.listActions = function(callback) {
  this.listLocations((locations) => {
    var json = { cmd: 'listactions' };
    var onMessage = (actions, socket) => {
      this.setMaxListeners(actions.data.length);
      var parsedActions = [];
      actions.data.forEach((action) => {
        parsedActions[action.id] = new Action(action, locations[action.location], this);
      });
      socket.destroy();
      callback(parsedActions);
    }

    this.execute(json, onMessage);
  });
}

HomeControlClient.prototype.listLocations = function(callback) {
  var json = { cmd: 'listlocations' };
  var onMessage = (locations, socket) => {
    var parsedLocations = [];
    locations.data.forEach(function(location) {
      parsedLocations[location.id] = new Location(location);
    });
    socket.destroy();
    callback(parsedLocations);
  }

  this.execute(json, onMessage);
}

HomeControlClient.prototype.executeAction = function(action) {
  var value = 0;
  if (action.value1 == value) {
    value = 100;
  }

  var json = {
    cmd: 'executeactions',
    id: action.id,
    value1: value
  };

  var onMessage = (result, socket) => {
    socket.destroy();
  }

  this.execute(json, onMessage);
}

module.exports = HomeControlClient;
