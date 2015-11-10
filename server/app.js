var express = require('express');
var app = express();
var db = require('mongoose');

db.connect('mongodb://mongo:ilove1150@ds051534.mongolab.com:51534/notely');

var NoteSchema = db.Schema({
  title: String,
  body_html: String,
  body_text: String,
  updated_at: { type: Date, default: Date.now }
});

var Note = db.model('Note', NoteSchema);

// Cross-Origin Request (CORS) middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/notes', function(req, res) {
  Note.find().then(function(notes) {
    res.json(notes);
  });
});

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});
