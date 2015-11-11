var express = require('express');
var app = express();
var Note = require('./models/note');

// Body parsing for JSON POST payloads
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Cross-Origin Request (CORS) middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.get('/notes', function(req, res) {
  Note.find().sort({ updated_at: 'desc' }).then(function(notes) {
    res.json(notes);
  });
});

app.post('/notes', function(req, res) {
  var note = new Note({
    title: req.body.note.title,
    body_html: req.body.note.body_html
  });

  note.save().then(function(noteData) {
    res.json({ message: 'Successfully updated note', note: noteData });
  });
});

app.listen(3001, function() {
  console.log('Listening on http://localhost:3001');
});
