'use strict';

let http = require('http');
let mongoose = require('mongoose');
let config = require('./server/settings/config');
let init = require('./server/init');
let routes = require('./server/router/routes');

init();

let server = http.createServer(routes.handleRequest);
mongoose.connect(config.mongodb_uri, config.mongodb_options)
    .then(() => {
        LOG('Connected to db!... Starting server...');
        server.listen(config.PORT);
    },
        (err) => {
            LOG(err);
        });
