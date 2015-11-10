var express = require('express');
var app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/notes', function(req, res) {
  res.json([
    {
      title: 'Hardcoded note',
      body_html: 'This is the body of my hardcoded note.'
    },
    {
      title: 'Another one',
      body_html: 'w00t'
    }
  ]);
});

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
