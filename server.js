var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

var server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, function() {
    console.log('Listening on port %d', server_port);
});