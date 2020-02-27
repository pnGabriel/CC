'use strict';

let moment = require('moment');

exports.addMinutes = function(date_obj, minutes){
  return moment(date_obj).add(minutes, 'm').toDate();
};

exports.addSeconds = function(date_obj, seconds){
    return moment(date_obj).add(seconds, 's').toDate();
};