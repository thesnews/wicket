var mongoose = require('mongoose'),
    moment = require('moment'),
    wicket = require('../wicket'),
    conf = require('../../config');

module.exports = {
    schema: mongoose.Schema({
        expires: {type: Number, default: (function() { return moment().add('d', 1).utc().unix(); })},
        hash: {type: String, default: (function(){ return wicket.token(); })}
    }),
    model: false
};

module.exports.model = mongoose.model('Apikey', module.exports.schema);

module.exports.check = function(req, res, next) {
    req.apikey = false;
    req.signature = req.param('sig') || false;

    if( req.signature == conf.private_key ) {
        next();
        return;
    }

    if( req.cookies._wicketk ) {

        var expire = moment().utc().unix();
        module.exports.model
            .find({hash: req.cookies._wicketk})
            .where('expires').gt(expire)
            .limit(1)
            .exec(function(s, resp) {
                if( resp.length ) {
                    var k = resp[0];
                    req.apikey = k;
                    next();
                } else {
                    var my_key = new module.exports.model;
                    my_key.save();

                    res.cookie('_wicketk', my_key.hash, {maxAge:86400000});

                    req.apikey = my_key;

                    next();
                }
            });
    } else {
        var my_key = new module.exports.model;
        my_key.save();

        res.cookie('_wicketk', my_key.hash, {maxAge:86400000});
        req.apikey = my_key;

        next();
    }
}