var router = require('express').Router();
var User = require('../models/user');

router.post('/', function(req, res) {
  console.log('before new user');
  var user = new User({
    username: req.body.user.username,
    name: req.body.user.name
  });
console.log('before save')
  user.save().then(function(userData) {
    console.log('on success')
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
