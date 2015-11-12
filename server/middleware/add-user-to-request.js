var jwt = require('jsonwebtoken');
var User = require('../models/user');

module.exports = function(req, res, next) {
  var authToken = req.headers.authorization;
  var isLoggingInOrRegistering = req.body.user;

  if (authToken && !isLoggingInOrRegistering) {
    // Decode user ID from JWT token, and find user
    jwt.verify(authToken, process.env.JWT_SECRET,
      function(err, decodedId) {
        if (decodedId) {
          User.findOne({ _id: decodedId }).then(function(user) {
            req['user'] = user;
            next();
          });
        }
        else {
          res.sendStatus(401);
        }
     });
  }
  else {
    next();
  }
};
