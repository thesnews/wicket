var mongoose = require('mongoose'),
    moment = require('moment'),
    wicket = require('../wicket');

module.exports = {
     schema: mongoose.Schema({
        expires: {type: Number, default: (function() { return moment().add('d', 1).utc().unix(); })},
        hash: {type: String, default: (function(){ return wicket.token(); })}
    }),
    model: false
};

module.exports.model = mongoose.model('Apikey', module.exports.schema);