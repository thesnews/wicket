var mongoose = require('mongoose'),
    wicket = require('../wicket'),
    conf = require('../../config');

module.exports = {
    schema: mongoose.Schema({
        site: String,
        title: String,
        callback: String,
        hash: {type: String, default: (function(){ return wicket.token(); })}
    }),
    model: false
};

module.exports.model = mongoose.model('Widget', module.exports.schema);

module.exports.check = function(req, res, next) {
    req.widget = false;

    if( req.param('wid') ) {

        module.exports.model
            .findOne({hash: req.param('wid')}, function(e, resp) {
                if( !e && resp ) {
                    req.widget = resp;
                }
                next();
            });
    } else {
        next();
    }
}