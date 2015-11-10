var express = require('express');
var app = express();

// Cross-Origin Request (CORS) middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


app.get('/notes', function(req, res) {
  res.json([
    {
      title: 'Hardcoded note!',
      body_html: 'Cool note.'
    },
    {
      title: 'Super-groovy',
      body_html: 'Read it and weep.'
    }
  ]);
});

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
