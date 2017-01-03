'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const EventEmitter = require('events');
const dgram = require('dgram');
const ip = require('ip');
const Action = require('./Action');
const Location = require('./Location');
const Socket = require('./JsonSocket');

const NHC_PORT = 8000;

function HomeControlClient() {
  EventEmitter.call(this);

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
  var cmd = { cmd: command };
  this.socket.write(JSON.stringify(cmd));
}

HomeControlClient.prototype.connect = function(host) {
  var socket = dgram.createSocket('udp4');

  socket.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socket.close();
  });

  socket.on('message', (msg, rinfo) => {
    if (ip.address() != rinfo.address) {
      this.socket.connect(NHC_PORT, rinfo.address);
      this.socket.setKeepAlive(true, 12000);
      socket.close();
    }
  });

  socket.bind(10000, function() {
    socket.setBroadcast(true);
    socket.send('D', 0, 1, 10000, "255.255.255.255");
  });
}

HomeControlClient.prototype.listActions = function(callback) {
  if (this.closed) {
    throw new Error('Connection to the Niko Home Control installation is closed.');
  }

  var self = this;

  this.listLocations(function(locations) {

    var socket = new Socket();
    socket.connect(self.socket.remotePort, self.socket.remoteAddress)

    socket.on('connect', function() {
      var listactions = { cmd: 'listactions' };
      socket.write(JSON.stringify(listactions))
    });

    socket.on('message', function(actions) {
      self.setMaxListeners(actions.data.length);

      var parsedActions = [];
      actions.data.forEach(function(action) {
        parsedActions[action.id] = new Action(action, locations[action.location], self);
      });

      callback(parsedActions);
    });

  });
}

HomeControlClient.prototype.listLocations = function(callback) {
  if (this.closed) {
    throw new Error('Connection to the Niko Home Control installation is closed.');
  }

  var socket = new Socket();
  var self = this;

  socket.connect(this.socket.remotePort, this.socket.remoteAddress)

  socket.on('connect', function() {
    var listlocations = { cmd: 'listlocations' };
    socket.write(JSON.stringify(listlocations))
  });

  socket.on('message', function(locations) {
    var parsedLocations = [];
    locations.data.forEach(function(location) {
      parsedLocations[location.id] = new Location(location);
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
