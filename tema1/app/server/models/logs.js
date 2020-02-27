'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let logs_schema = Schema({
   request:{
       type: Object,
       required: true,
       blackbox: true,
       default: {}
   },
    response:{
       type: Object,
        required: true,
        blackbox: true,
        default: {}
    },
    date:{
       type: Date,
        required: true,
        default: new Date()
    },
    latency:{
       type: Number,
        required: true
    }
});

let LogsSchema = new mongoose.Schema(logs_schema,
    { collation: { locale: 'en_US', strength: 1 } });
    // {});
LogsSchema.set('autoIndex', false);
module.exports = mongoose.model('Logs', LogsSchema);