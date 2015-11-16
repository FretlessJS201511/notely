require('dotenv').load();
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var path = require('path');
app.use(express.static(path.join(__dirname, '../client/app')));

app.use(require('./middleware/headers'));
app.use(require('./middleware/add-user-to-request'));

app.use('/api/v1/notes', require('./routes/notes'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/sessions', require('./routes/sessions'));

var port = (process.env.PORT || 3000);
app.listen(port, function() {
  console.log('Listening on http://localhost:'+port);
});
