var express = require('express');
var app = express();

// Body parsing for JSON POST payloads
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Middlewares
app.use(require('./middlewares/headers'));

// Routes
app.use('/notes', require('./routes/notes'));
app.use('/users', require('./routes/users'));

app.listen(3001, function() {
  console.log('Listening on http://localhost:3001');
});
