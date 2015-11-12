require('dotenv').load();
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(require('./middleware/headers'));

app.use('/api/v1/notes', require('./routes/notes'));
app.use('/api/v1/users', require('./routes/users'));

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
