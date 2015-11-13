var router = require('express').Router();
var Note = require('../models/note');

// List all notes
router.get('/', function(req, res) {
  Note.find({ user: req.user }).sort({ updated_at: -1 }).then(function(notes) {
    res.json(notes);
  });
});

// Create a new note
router.post('/', function(req, res) {
  var note = new Note({
    title: req.body.note.title,
    body_html: req.body.note.body_html,
    user: req.user
  });

  note.save().then(function(noteData) {
    res.json({
      message: 'Saved!',
      note: noteData
    });
  });
});

// Update an existing note
router.put('/:id', function(req, res) {
  Note.findOne({ _id: req.params.id, user: req.user }).then(function(note) {
    note.title = req.body.note.title;
    note.body_html = req.body.note.body_html;
    note.save().then(function() {
      res.json({
        message: 'Your changes have been saved.',
        note: note
      });
    },
    function () {
      res.send(500, 'Oops! There was a problem saving.');
    }
  );
  });
});

router.delete('/:id', function(req, res) {
  Note.findOne({ _id: req.params.id, user: req.user }).then(function(note) {
    note.remove().then(function() {
      res.json({
        message: 'That note has been deleted.',
        note: note
      });
    });
  });
});

module.exports = router;
