var db = require('mongoose');
db.connect('mongodb://mongo:ilove1150@ds051534.mongolab.com:51534/notely');

module.exports = db;
