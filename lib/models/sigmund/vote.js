var mongoose = require('mongoose');

module.exports = {
     schema: mongoose.Schema({
        date: Date,
        ip: String,
        story: {type: mongoose.Schema.Types.ObjectId, ref: 'Story'},
        site: String
    }),
    model: false
};

module.exports.model = mongoose.model('Vote', module.exports.schema);