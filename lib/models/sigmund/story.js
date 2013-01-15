var mongoose = require('mongoose'),
    moment = require('moment'),
    wicket = require('../../wicket'),
    markdown = require("node-markdown");

module.exports = {
     schema: mongoose.Schema({
        content: String,
        date: {type: Number, default: (function() { return moment().utc().unix(); })},
        name: String,
        email: String,
        ip: String,
        votes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Vote'}],
        votes_total: Number,
        widget: [{type: mongoose.Schema.Types.ObjectId, ref: 'Widget'}],
        hash: {type: String, default: (function() { return wicket.token()})},
        approved: {type: Boolean, default: false},
        validated: {type: Boolean, default: false},
        contact: {type: Boolean, default: false},
        type: String
    }),
    model: false
};

module.exports.schema.virtual('first_name').get(function() {
    if( this.name.indexOf(' ') !== -1 ) {
        return this.name.substr(0, this.name.indexOf(' '));
    }

    return this.name;
});
module.exports.schema.virtual('content_formatted').get(function() {
//    return this.content.replace(/((\r\n)|\r|\n)/g, '<br />');
    return markdown.Markdown(this.content);
});

module.exports.schema.pre('save', function(next) {
    this.votes_total = this.votes.length;
    next();
});


module.exports.model = mongoose.model('Story', module.exports.schema);

module.exports.load = function(req, res, next) {
    var s = req.route.params.hash || false;
    if( !req.sigmund
    ) {
        req.sigmund = {};
    }

    req.sigmund.story = false;

    if( s ) {
        module.exports.model.find({hash:s}).populate('widget').exec(function(e, resp) {
            if( resp.length ) {
                req.sigmund.story = resp[0];
            }

            next();
        });
    } else {
        next();
    }
}