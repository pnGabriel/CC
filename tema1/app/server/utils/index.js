let Logs = require('../models/logs');
exports.date_ops = require('./date_ops');

exports.set_text_status = function(res, status){
    res.writeHead(status, {'Content-Type': 'text/html'})
};


let LOG_DB = function(req, res, json_data) {
    let latency = new Date() - req.time;
    let time = req.time;
    delete req.time;
    let new_log = new Logs({
        request: {
            'headers': req.headers,
            'url': req.url,
            'method': req.method,
            'ip': req.connection.remoteAddress
        },
        response: {
            '_header': res._header,
            '_has_body': res._has_body,
            'statusMessage': res.statusMessage,
            'statusCode': res.statusCode,
            'data': json_data
        },
        date: time,
        latency: latency
    });
    new_log.save()
        .then(() => {
            LOG('log added!');
        })
        .catch((err) => {
            LOG('Failed to save log!');
            LOG(err);
        });
};

exports.send_json_data = function(req, res, status, json_data) {
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify( json_data ));
    LOG_DB(req, res, json_data);
};

exports.parse = function (obj) {
    let res = null;
    try {
        res = JSON.parse(obj);
    } catch (e) {
        res = null;
    }
    return res;
};

exports.load_body = function (req, res, callback){
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        body = Buffer.concat(body).toString();
        body = this.parse(body);

        req.body = body;
        if (body === null) req.body = undefined;

        callback(req, res);
    });
};


