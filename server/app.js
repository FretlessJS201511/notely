var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.json([
    {
      title: 'Hardcoded note',
      body_html: 'Cool note.'
    },
    {
      title: 'Super-cool',
      body_html: 'Read it and weep.'
    }
  ]);
});

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
