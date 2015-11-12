var router = require('express').Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');

router.post('/', function(req, res) {
  var user = new User({
    username: req.body.user.username,
    name: req.body.user.name,
    password_digest: bcrypt.hashSync(req.body.user.password)
  });

  user.save().then(function(userData) {
    res.json({
      message: 'Thanks for signing up!',
      user: userData
    });
  },
  function(err) {
    console.log(err);
  });
});

module.exports = router;
