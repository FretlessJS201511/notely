var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('I <3 Express!');
})

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
