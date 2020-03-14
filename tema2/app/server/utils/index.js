let url = require('url');

let isEmptyObject = function(obj) {
    return !Object.keys(obj).length;
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

exports.get_querystring_data = function(req, res){

    let query = url.parse(req.url, true).query;
    if(!isEmptyObject(query))
        req.query = query;
    else
        req.query = undefined;

};

exports.send_json_data = function(req, res, status, json_data) {
    res.writeHead(status, {'Content-Type': 'application/json'});
    res.end(JSON.stringify( json_data ));
};

exports.check_duplicates = function(req, res, err){
    if(err.hasOwnProperty("name") && err.hasOwnProperty("code") && err.hasOwnProperty("keyValue")) {
        if(err.name === "MongoError" && err.code === 11000){
            this.send_json_data(req, res, 409, err.keyValue);
            return true;
        }
        return false;
    }
    return false;
};

exports.errors = {
    methodNotAllowed(req, res) {exports.send_json_data(req, res, 405, {"Error": "Method not allowed!"})},
    notFound(req, res){exports.send_json_data(req, res, 404, {"Error": "Not Found!"})}
};
