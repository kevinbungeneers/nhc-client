'use strict';

const EventEmitter = require('events');
const Action = require('./Action');
const Location = require('./Location');
const Socket = require('./JsonSocket');
const DiscoveryService = require('./util/DiscoveryService');

const NHC_PORT = 8000;

function HomeControlClient() {
  EventEmitter.call(this);

  this.discoveryService = new DiscoveryService();
  this.socket = new Socket();
  this.closed = true;

  this.socket.on('message', this.onMessage.bind(this));
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('close', this.onClose.bind(this));
}

HomeControlClient.prototype = Object.create(EventEmitter.prototype);
HomeControlClient.prototype.constructor = HomeControlClient;

HomeControlClient.prototype.onConnect = function() {
  this.closed = false;
  this.executeCommand('startevents');
  this.emit('connect');
}

HomeControlClient.prototype.onClose = function(hadError) {
  this.closed = true;
}

HomeControlClient.prototype.onMessage = function(json) {
  if (json.hasOwnProperty('event')) {
    this.emit(json.event, json.data);
  }
}

HomeControlClient.prototype.executeCommand = function(command) {
  this.socket.write(
    { cmd: command }
  );
}

HomeControlClient.prototype.connect = function() {
  this.discoveryService.on('discover', (host) => {
    this.socket.connect(NHC_PORT, host);
    this.socket.setKeepAlive(true, 12000);
  });

  this.discoveryService.discover();
}

HomeControlClient.prototype.listActions = function(callback) {
  if (this.closed) {
    throw new Error('Connection to the Niko Home Control installation is closed.');
  }

  this.listLocations((locations) => {

    var socket = new Socket();

    socket.on('connect', () => {
      socket.write(
        { cmd: 'listactions' }
      );
    });

    socket.on('message', (actions) => {
      this.setMaxListeners(actions.data.length);

      var parsedActions = [];
      actions.data.forEach((action) => {
        parsedActions[action.id] = new Action(action, locations[action.location], this);
      });

      callback(parsedActions);
    });

    socket.connect(this.socket.remotePort, this.socket.remoteAddress);
  });
}

HomeControlClient.prototype.listLocations = function(callback) {
  if (this.closed) {
    throw new Error('Connection to the Niko Home Control installation is closed.');
  }

  var socket = new Socket();

  socket.on('connect', () => {
    socket.write(
      { cmd: 'listlocations' }
    );
  });

  socket.on('message', (locations) => {
    var parsedLocations = [];
    locations.data.forEach(function(location) {
      parsedLocations[location.id] = new Location(location);
    });

    callback(parsedLocations);
  });

  socket.connect(this.socket.remotePort, this.socket.remoteAddress)
}

HomeControlClient.prototype.executeAction = function(id, value) {
  this.socket.write(
    {
      cmd: 'executeactions',
      id: id,
      value1: value
    }
  );
}

module.exports = HomeControlClient;
