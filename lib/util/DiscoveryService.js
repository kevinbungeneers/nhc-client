const EventEmitter = require('events');
const dgram = require('dgram');
const ip = require('ip');

'use strict';

function DiscoveryService() {
  EventEmitter.call(this);
}

DiscoveryService.prototype = Object.create(EventEmitter.prototype);
DiscoveryService.prototype.constructor = DiscoveryService;

DiscoveryService.prototype.discover = function() {
  var socket = dgram.createSocket('udp4');

  socket.on('error', (error) => {
    console.log(error);
    socket.close();
  });

  socket.on('message', (msg, rinfo) => {
    if (ip.address() != rinfo.address) {
      this.emit('discover', rinfo.address);
      socket.close();
    }
  });

  socket.bind(10000, () => {
    socket.setBroadcast(true);
    socket.send('D', 0, 1, 10000, "255.255.255.255");
  });
}

module.exports = DiscoveryService;
