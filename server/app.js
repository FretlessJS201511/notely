var express = require('express');
var app = express();
var Note = require('./models/note');

// Body parsing for JSON POST payloads
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Allow CORS, more headers, and more HTTP verbs
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
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
    res.json({ message: 'Saved!', note: noteData });
  });
});

app.put('/notes/:id', function(req, res) {
  Note.findOne({ user: req.user, _id: req.params.id }).then(function(note) {
    note.title = req.body.note.title;
    note.body_html = req.body.note.body_html;
    note.save().then(function() {
      res.json({ message: 'Saved changes!', note: note });
    });
  });
});

app.listen(3001, function() {
  console.log('Listening on http://localhost:3001');
});
