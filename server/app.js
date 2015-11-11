require('dotenv').load();
var express = require('express');
var app = express();
var Note = require('./models/note');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

// Allow CORS, additional headers, and HTTP methods
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

// List all notes
app.get('/notes', function(req, res) {
  Note.find().sort({ updated_at: -1 }).then(function(notes) {
    res.json(notes);
  });
});

// Create a new note
app.post('/notes', function(req, res) {
  var note = new Note({
    title: req.body.note.title,
    body_html: req.body.note.body_html
  });

  note.save().then(function(noteData) {
    res.json({
      message: 'Saved!',
      note: noteData
    });
  });
});

// Update an existing note
app.put('/notes/:id', function(req, res) {
  Note.findOne({ _id: req.params.id }).then(function(note) {
    note.title = req.body.note.title;
    note.body_html = req.body.note.body_html;
    note.save().then(function() {
      res.json({
        message: 'Your changes have been saved.',
        note: note
      });
    });
  });
});

app.delete('/notes/:id', function(req, res) {
  Note.findOne({ _id: req.params.id }).then(function(note) {
    note.remove().then(function() {
      res.json({
        message: 'That note has been deleted.',
        note: note
      });
    });
  });
});

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});










//
