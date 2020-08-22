var resourceful = require('resourceful');

var User = module.exports = resourceful.define('user', function () {
  this.use('couchdb');
  this.string('name');
  this.string('email');
  this.string('password');
  this.timestamps();

});