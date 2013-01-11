var mongoose = require('mongoose'),
    moment = require('moment');

module.exports = {
     schema: mongoose.Schema({
        date: {type: Number, default: (function() { return moment().utc().unix(); })},
        ip: String,
        story: {type: mongoose.Schema.Types.ObjectId, ref: 'Story'},
        story_hash: String,
        site: String,
        hash: String
    }),
    model: false
};

module.exports.model = mongoose.model('Vote', module.exports.schema);