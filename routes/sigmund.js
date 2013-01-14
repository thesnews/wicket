var wicket = require('../lib/wicket'),
    _ = require('underscore'),
    conf = require('../config'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    story = require('../lib/models/sigmund/story'),
    vote = require('../lib/models/sigmund/vote')
    apikey = require('../lib/models/apikey'),
    widget = require('../lib/models/widget');

var postmark = require('postmark-api')(conf.postmark.key);

module.exports = function(app) {

    app.get('/sigmund.js', [apikey.check, widget.check], function(req, res){

        res.render(
            'sigmund/index',
            {
                token: req.apikey.hash,
                widget: req.widget
            }
        );

    });

    app.get('/sigmund/:hash/vote', [apikey.check, story.load], function(req, res) {
        var now = moment().utc().unix();

        var render = function(o) {
            res.jsonp(o);
        };

        if( !req.signature ) {
            res.jsonp({
                isError: true,
                message: 'Missing or invalid key'
            });
            return;
        }

        var lim = moment().utc().subtract('m', 1).unix();

        vote.model
            .find({story_hash: req.sigmund.story.hash, hash: req.apikey.hash})
            .where('date').gte(lim)
            .exec(function(e, resp) {

                if( resp.length ) {
                    render({
                        isError: true,
                        message: 'You\'ve already voted for this story in the last 24 hours'
                    });
                    return;
                }

                var new_vote = new vote.model;
                new_vote.ip     = req.ip;
                new_vote.story  = req.sigmund.story._id;
                new_vote.story_hash = req.sigmund.story.hash;
                new_vote.site   = 'statenews.com';
                new_vote.hash   = req.apikey.hash;
                new_vote.save();

                req.sigmund.story.votes.push(new_vote);
                req.sigmund.story.save();

                render(new_vote);
            });
    });

    app.get('/sigmund/submit', widget.check, function(req, res) {
        var name        = req.param('name'),
            content     = req.param('story'),
            email       = req.param('email'),
            ip          = req.ip
            contact     = req.param('contact') || 0;

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

        if( !req.widget ) {
            res.jsonp({
                isError: true,
                message: 'Invalid site id'
            });
            return;
        }

        var s = new story.model;
        s.content = content;
        s.name = name;
        s.email = email;
        s.ip = ip;
        s.contact = contact;
        s.widget = req.widget._id;
        s.save();

        res.jsonp(s);
    });

    app.get('/sigmund/stories', apikey.check, function(req, res) {
        var limit   = 10,
            skip    = req.param('offset') || 0;

//        var search_params = {approved:true};
        var search_params = {};
        if( req.signature == conf.private_key ) {
            search_params = {};
        }

        story.model
            .find(search_params)
            .limit(limit)
            .skip(skip)
            .exec(function(e, resp) {
                if( e ) {
                    res.jsonp({
                        isError: true,
                        message: 'Please try again later'
                    });
                    return;
                }

                if( !req.signature || req.signature != conf.private_key ) {
                    var out = [];
                    _.each(resp, function(item) {
                        out.push({
                            name:       item.first_name,
                            content:    item.content,
                            approved:   item.approved,
                            hash:       item.hash,
                            votes:      item.votes,
                            date:       item.date,
                        });
                    });

                    resp = out;
                }

                res.jsonp(resp);
            });

    });

    app.get('/sigmund/:hash', [apikey.check, story.load], function(req, res) {

        if( !req.sigmund.story ) {
            res.jsonp({
                isError: true,
                message: 'Story not found'
            });
            return;
        }

        if( !req.signature || req.signature != conf.private_key ) {
            var out = {
                name:       req.sigmund.story.first_name,
                content:    req.sigmund.story.content,
                approved:   req.sigmund.story.approved,
                hash:       req.sigmund.story.hash,
                votes:      req.sigmund.story.votes,
                date:       req.sigmund.story.date,
            };

            resp = out;
        } else {
            out = req.sigmund.story;
        }

        res.jsonp(out);
    });

    app.get('/sigmund/:hash/approve', [apikey.check, story.load], function(req, res) {

        if( req.signature != conf.private_key ) {
            res.send();
            return;
        }

        if( !req.sigmund.story ) {
            res.jsonp({
                isError: true,
                message: 'Story not found'
            });
            return;
        }
        req.sigmund.story.approved = true;
        req.sigmund.story.save();

        if( req.sigmund.story.contact ) {
            var message = "We need to verify your email address in order to approve your story.\n\nPlease visit the following link to verify your post:\n\n"
                +'widget.getsnworks.com/'+s.hash+'/verify'
                +"\n\nThanks!";

            postmark.send({
                'From':     'webmaster@statenews.com',
                'To':       s.email,
                'Subject':  'Please verify your email address',
                'TextBody':  message
            }, function (err, res) {
                if( err ) {
                    console.log(res);
                }
            });
        }

        res.jsonp(req.sigmund.story);

    });

    app.get('/sigmund/:hash/remove', [apikey.check, story.load], function(req, res) {

        if( req.signature != conf.private_key ) {
            res.send();
            return;
        }

        if( !req.sigmund.story ) {
            res.jsonp({
                isError: true,
                message: 'Story not found'
            });
            return;
        }

        req.sigmund.story.remove();

        res.jsonp(req.sigmund.story);
    });

}