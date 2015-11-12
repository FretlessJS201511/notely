var db = require('../config/db');

var UserSchema = db.Schema({
  username: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  // password_digest: { type: String, required: true },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = UserSchema;
