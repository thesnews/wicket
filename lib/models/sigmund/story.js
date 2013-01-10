var mongoose = require('mongoose');

module.exports = {
     schema: mongoose.Schema({
        content: String,
        name: String,
        email: String,
        ip: String,
        votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vote'}],
        site: String
    }),
    model: false
};

module.exports.model = mongoose.model('Story', module.exports.schema);