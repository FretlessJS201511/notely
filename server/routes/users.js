var router = require('express').Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

router.post('/', function(req, res) {
  var user = new User({
    username: req.body.user.username,
    name: req.body.user.name,
    password_digest: bcrypt.hashSync(req.body.user.password)
  });

  user.save().then(function(userData) {
    var token = jwt.sign(userData._id, process.env.JWT_SECRET, { expiresIn: 24*60*60 });
    res.json({
      message: 'Thanks for signing up!',
      user: userData,
      auth_token: token
    });
  },
  function(err) {
    console.log(err);
  });
});

module.exports = router;
