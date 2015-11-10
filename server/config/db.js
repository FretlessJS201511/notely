var db = require('mongoose');
db.connect('mongodb://mongo:ilove1150@ds053198.mongolab.com:53198/notelydb');

module.exports = db;
