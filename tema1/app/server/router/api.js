let utils = require('../utils');
let http = require('http');
let https = require('https');
let Logs = require('../models/logs');
let secret = require('../settings/secret');

let externAPI = {
    api_randomIMG(req, res, callback){
        http.get(
            'http://www.splashbase.co/api/v1/images/random',
            (res) =>{
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                callback(data, null);
            })
        }).on('error', (err) => {
            callback(null, err);
        })
    },
    api_randomJoke(req, res, callback){
        https.get(
            'https://sv443.net/jokeapi/category/Programming?blacklistFlags=nsfw&type=single',
            (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                callback(data, null);
            })
        }).on('error', (err) =>{
            callback(null, err);
        })
    },
    api_random_org(req, res, callback){
        let jsonData = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "generateIntegers",
            "params": {
            "apiKey": secret.random_org.api_key,
                "n": 1,
                "min": 1,
                "max": 1000,
                "replacement": true
        },
            "id": 42
        });
        let options = {
            hostname: 'api.random.org',
            path: '/json-rpc/2/invoke',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': jsonData.length
            }
        };
        let r = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                callback(data, null);
            })
        }).on('error', (err) => {
            callback(null, err);
        });
        r.write(jsonData);
        r.end();
    }

};

let metricsHandler = function(request, response){
    let count_limit = 10 ** 30;
    let match_condition = {};
    let starting_date = null;
    let current_date = new Date();
    if(request.body != null) {
        if (request.body.hasOwnProperty("limit")) {
            count_limit = request.body.limit;
        }
        if (request.body.hasOwnProperty("last_minutes")) {
            starting_date = utils.date_ops.addMinutes(current_date, -(request.body.last_minutes));
            current_date = starting_date;
        }
        if (request.body.hasOwnProperty("last_seconds")) {
            starting_date = utils.date_ops.addSeconds(current_date, -(request.body.last_seconds));
        }
    }
    if(starting_date != null){
        match_condition = {date: { $gte: starting_date}};
    }
  Logs.aggregate([{
  $match : match_condition
  },{
      $sort: { date: -1 }
  },{
      $limit: count_limit
  },{
  $group: {
      _id: null,
      unique_ips: {$addToSet: "$request.ip"},
      avg_latency: {
          $avg: "$latency"
      },
      count: {
          $sum: 1
      }
    }
  }
  ],
      function(err, res){
      if(err){
          LOG(err);
          utils.send_json_data(request, response, 404, {"Message": "DB error!"});
      }else{
          if(res){
              let r = res[0];
              if(r === [] || r === null || r === undefined){
                r = {
                    _id : null,
                    unique_ips: [],
                    avg_latency: 0,
                    count: 0

                }
              }
              delete r._id;
              r.unique_ips = r.unique_ips.length;
              utils.send_json_data(request, response, 200, r);
          }
      }
      });
};

let randomHandler = function(request, response){
    externAPI.api_randomIMG(request, response, (data, err) => {
        if(err){
            utils.send_json_data(request, response, 404, {"Message": "Error on randomIMG API!"});
        }else{
            let random_img = utils.parse(data);
            if(random_img == null){
                utils.send_json_data(request, response, 404, {"Message": "Error on randomIMG API!"});
                return;
            }
            externAPI.api_randomJoke(request, response, (data, err) => {
                if(err){
                    utils.send_json_data(request, response, 404, {"Message": "Error on randomJoke API!"});
                }else{
                    let random_joke = utils.parse(data);
                    if(random_joke == null){
                        utils.send_json_data(request, response, 404, {"Message": "Error on randomJoke API!"});
                        return;
                    }

                    let api_res = {};
                    api_res.image_url = random_img.url;
                    api_res.image_id = random_img.id;
                    switch (random_joke.type) {
                        case 'single':
                            api_res.joke = random_joke.joke;
                            break;
                        case 'twopart':
                            api_res.joke = random_joke.setup + '\n' + random_joke.delivery;
                            break;
                    }
                    utils.send_json_data(request, response, 200, api_res);
                }
            });
            // utils.send_json_data(response, 200, JSON.parse(data));
        }
    });
};

let randomHandlerV2 = function(request, response){
    externAPI.api_randomIMG(request, response, (data, err) => {
        if(err){
            utils.send_json_data(request, response, 404, {"Message": "Error on randomIMG API!"});
        }else{
            let random_img = utils.parse(data);
            if(random_img == null){
                utils.send_json_data(request, response, 404, {"Message": "Error on randomIMG API!"});
                return;
            }
            externAPI.api_random_org(request, response, (data, err) => {
                if(err){
                    utils.send_json_data(request, response, 404, {"Message": "Error on random.org API!"});
                }else{
                    let random_nr = utils.parse(data);
                    if(random_nr == null){
                        utils.send_json_data(request, response, 404, {"Message": "Error on random.org API!"});
                        return;
                    }

                    let api_res = {};
                    api_res.image_url = random_img.url;
                    api_res.image_id = random_img.id;
                    try{
                        api_res.random_nr = random_nr.result.random.data[0];
                    }catch (e) {
                        utils.send_json_data(request, response, 404, {"Message": "Error on random.org API!"});
                    }
                    utils.send_json_data(request, response, 200, api_res);
                }
            });
            // utils.send_json_data(response, 200, JSON.parse(data));
        }
    });
};

module.exports = {
    handleAPIRequests(path, request, response){
        switch (path) {
            case '/api/random':
                randomHandler(request,response);
                break;
            case '/api/random/v2':
                randomHandlerV2(request,response);
                break;
            case '/api/metrics':
                metricsHandler(request, response);
                break;
            default:
                utils.send_json_data(request, response, 404, {"Message": "Not Found!"});
        }
    }
};