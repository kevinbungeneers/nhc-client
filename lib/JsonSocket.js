'use strict';

const Socket = require('net').Socket;
const EventEmitter = require('events');
const StringDecoder = require('string_decoder').StringDecoder;

function JsonSocket() {
  EventEmitter.call(this);

  this.socket = new Socket();
  this.decoder = new StringDecoder('utf8');
  this.buffer = '';

  this.socket.on('data', this.onData.bind(this));
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('close', this.onClose.bind(this));
  this.socket.on('err', this.onError.bind(this));
}

JsonSocket.prototype = Object.create(EventEmitter.prototype);
JsonSocket.prototype.constructor = JsonSocket;

Object.defineProperty(JsonSocket.prototype, 'remotePort', {
  get: function() {
    return this.socket.remotePort;
  }
});

Object.defineProperty(JsonSocket.prototype, 'remoteAddress', {
  get: function() {
    return this.socket.remoteAddress;
  }
});

JsonSocket.prototype.onData = function(data) {
  this.buffer += this.decoder.write(data);
  if(this.buffer.indexOf("\n") > -1) {
    this.buffer.trim();
    var parts = this.buffer.trim().split("\n");

    for (var i = 0; i < parts.length; i++) {
      this.emit('message', JSON.parse(parts[i]));
    }

    this.buffer = '';
  }
}

JsonSocket.prototype.onConnect = function() {
  this.emit('connect');
}

JsonSocket.prototype.onClose = function(hadError) {
  this.emit('close', hadError);
}

JsonSocket.prototype.onError = function(error) {
  this.emit('error', error);
}

JsonSocket.prototype.connect = function(port, host) {
  this.socket.connect(port, host);
}

JsonSocket.prototype.write = function(data) {
  this.socket.write(JSON.stringify(data));
}

JsonSocket.prototype.setKeepAlive = function(enable, initialDelay) {
  this.socket.setKeepAlive(enable, initialDelay);
}

module.exports = JsonSocket;
