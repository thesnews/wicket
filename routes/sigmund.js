var wicket = require('../lib/wicket'),
    mongoose = require('mongoose'),
    moment = require('moment');

var db = wicket.dbh();

module.exports = function(app) {

    app.get('/sigmund.js', function(req, res){

        var tok = req.cookies._sigmund;

        if( !req.cookies._sigmund ) {
            tok = wicket.token();
            res.cookie('_sigmund', tok, {maxAge:86400000});
        }

        res.render(
            'sigmund/index',
            {
                token:tok
            }
        );
    });

    app.get('/sigmund/vote', function(req, res) {

    });

    app.get('/sigmund/submit', function(req, res) {
        var name        = req.param('name'),
            story       = req.param('story'),
            email       = req.param('email'),
            ip          = req.ip;
            now         = moment().utc().format('YYYY MM DD HH:mm ZZ');

        if( story ) {
            story = Buffer(story, 'base64').toString('ascii');
        }

        res.send(now);
        // Buffer("Hello World").toString('base64|ascii')
    });
}