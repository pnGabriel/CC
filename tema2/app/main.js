'use strict';

let http = require('http');
let mongoose = require('mongoose');
let config = require('./server/settings/config');
let init = require('./server/init');
let mainRouter = require('./server/router/mainRouter');

init();

let server = http.createServer(function(req, res){
    mainRouter.handleRequest(req, res);
});
mongoose.connect(config.mongodb_uri, config.mongodb_options)
    .then(() => {
        LOG('Connected to db!... Starting server...');
        server.listen(config.PORT);
    },
        (err) => {
            LOG(err);
        });
