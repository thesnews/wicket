var mongoose = require('mongoose'),
    moment = require('moment'),
    wicket = require('../../wicket');

module.exports = {
     schema: mongoose.Schema({
        content: String,
        date: {type: Number, default: (function() { return moment().utc().unix(); })},
        name: String,
        email: String,
        ip: String,
        votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vote'}],
        site: String,
        hash: {type: String, default: (function() { return wicket.token()})},
        approved: {type: Boolean, default: false}
    }),
    model: false
};

module.exports.model = mongoose.model('Story', module.exports.schema);