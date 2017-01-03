const HomeControlClient = require('./lib/HomeControlClient');
const Action = require('./lib/Action');
const Location = require('./lib/Location');
const dgram = require('dgram');

module.exports = {
  HomeControlClient: HomeControlClient,
  Action: Action,
  Location: Location
}
