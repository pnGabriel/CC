let utils = require('../utils');
let url = require('url');

let Router = class Router {
    constructor() {
        this.routes = Array();
    }

    add(method, url, handler){
        this.routes.push({method: method, url: url, handler: handler});
    }

    handleRequest(req, res){
        let routes = this.routes;
        utils.load_body(req, res, (req, res) => {
            utils.get_querystring_data(req, res);
            let path = url.parse(req.url).pathname;
            req.params = {};
            for(const handler of routes){
                if (req.method === handler.method){
                    let match = path.match(new RegExp(handler.url));
                    if(match){
                        if(match[0] === path || (match[0] + "/") === path) {
                            let val = match[1];
                            if(val !== undefined) {
                                req.params.id = match[1];
                            }
                            return handler.handler(req, res);
                        }
                    }
                }
            }
            utils.send_json_data(req, res, 404, {"Error": "Not Found!"});
        });
    }
};

module.exports = Router;