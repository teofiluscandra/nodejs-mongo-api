const mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect('mongodb://localhost/rental',{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('connected to MongoDB ...'))
    .catch(err => console.error('Could not connect to Mongo ', err));
}