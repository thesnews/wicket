var wicket = require('../lib/wicket'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    story = require('../lib/models/sigmund/story'),
    vote = require('../lib/models/sigmund/vote')
    apikey = require('../lib/models/apikey');

wicket.dbh();

var check_key = function(hash, next) {
    var expire = moment().utc().unix();
    apikey.model
        .find({hash: hash})
        .where('expires').gt(expire)
        .limit(1)
        .exec(function(s, resp) {
            if( resp.length ) {
               var k = resp[0];
                next(k);
            } else {
                next(false);
            }
        });
};

module.exports = function(app) {

    app.get('/sigmund.js', function(req, res){

        var render = function(my_key) {
            if( !my_key || !my_key.hash ) {
                my_key = new apikey.model;
                my_key.save();

                res.cookie('_sigmundk', my_key.hash, {maxAge:86400000});
            }

            res.render(
                'sigmund/index',
                {
                    token:my_key.hash
                }
            );
        };

        if( req.cookies._sigmundk ) {
            check_key(req.cookies._sigmundk, render);
        } else {
            render();
        }

    });

    app.get('/sigmund/vote', function(req, res) {
        var my_token        = req.param('sig'),
            my_vote         = req.param('vote'),
            now             = moment().utc().unix(),
            my_key          = false,
            existing_vote   = false;

        var fetch_story = function(k) {
            my_key = k;

            story.model.findOne({hash: my_vote}, function(e, resp) {

                if( !e && resp ) {
                    my_vote = resp;
                } else {
                    render({
                        isError: true,
                        message: 'No story found'
                    });
                    return;
                }

                check_votes();
            });
        }, check_votes = function() {
            var lim = moment().utc().subtract('d', 1).unix();

            vote.model
                .find({story_hash: my_vote.hash, hash: my_key.hash})
                .where('date').gte(lim)
                .exec(function(e, resp) {

                    if( resp.length ) {
                        render({
                            isError: true,
                            message: 'You\'ve already voted for this story in the last 24 hours'
                        });
                        return;
                    }

                    cast_vote();
                });
        }, cast_vote = function() {

            var new_vote = new vote.model;
            new_vote.ip     = req.ip;
            new_vote.story  = my_vote._id;
            new_vote.story_hash = my_vote.hash;
            new_vote.site   = 'statenews.com';
            new_vote.hash   = my_key.hash;
            new_vote.save();

            my_vote.votes.push(new_vote);
            my_vote.save();

            render(new_vote);

        }, render = function(o) {
            res.jsonp(o);
        };

        if( !my_token ) {
            res.jsonp({
                isError: true,
                message: 'Missing or invalid key'
            });
            return;
        }

        check_key(my_token, fetch_story);

    });

    app.get('/sigmund/submit', function(req, res) {
        var name        = req.param('name'),
            content     = req.param('story'),
            email       = req.param('email'),
            ip          = req.ip,
            now         = moment().utc().format('YYYY MM DD HH:mm ZZ');

        if( content ) {
            content = Buffer(content, 'base64').toString('ascii');
        }

        if( !name || !content || !email ) {
            res.jsonp({
                isError: true,
                message: 'You must provide name and email address'
            });
            return;
        }

        var s = new story.model;
        s.content = content;
        s.name = name;
        s.email = email;
        s.ip = ip;
        s.site = 'statenews.com';
        s.save();

        res.jsonp(s);
    });

    app.get('/sigmund/stories', function(req, res) {

        story.model.find({}, function(e, resp) {
            if( e ) {
                res.jsonp({
                    isError: true,
                    message: 'Please try again later'
                });
                return;
            }

            res.jsonp(resp);
        });

    });

    app.get('/sigmund/approve', function(req, res) {

    });
}