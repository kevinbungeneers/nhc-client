'use strict';

function Location(location) {
  this.location = location;
}

Object.defineProperty(Location.prototype, 'id', {
  get: function() {
    return this.location.id;
  }
});

Object.defineProperty(Location.prototype, 'name', {
  get: function() {
    return this.location.name;
  }
});

module.exports = Location;
