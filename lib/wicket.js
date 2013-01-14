/*
 * wicket
 * https://github.com/thesnews/wicket
 *
 * Copyright (c) 2013 Mike Joseph
 * Licensed under the MIT license.
 */

var mongoose = require('mongoose');

var _dbh = false;

exports.token = function(){
    var MAX = 9e15;
    var MIN = 1e15;
    var safegap = 1000;
    var counter = MIN;

    var increment = Math.floor(safegap*Math.random());
    if(counter > (MAX - increment)) counter = MIN;
    counter += increment;
    return counter.toString(36);
};
