const HomeControlClient  = require('./HomeControlClient');

var client = new HomeControlClient();
client.connect(8000, "192.168.0.226");
