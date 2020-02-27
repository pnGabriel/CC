const url = require('url');
let fs = require('fs');
let utils = require('../utils');
let api = require('./api');

html = {
    render(path, response){
        fs.readFile(path, null, function(err, data){
        if(err){
            utils.set_text_status(response,404);
            response.write("File not found!");
        }
        else{
            utils.set_text_status(response, 200);
            response.write(data);
        }
        response.end();
        });
    }
};

module.exports = {
  handleRequest(request, response){
      // try to load body first
      utils.load_body(request, response, (req, res) => {
          // process request
          let path = url.parse(request.url).pathname;
          request.time = new Date();
          switch (path) {
              case '/':
              case '/index.html':
                  html.render('./index.html', response);
                  break;
              case String(path.match(new RegExp('/api/.*'))):
                    api.handleAPIRequests(path, request, response);
                    break;
              default:
                  utils.set_text_status(response, 404);
                  response.write("Route not found!");
                  response.end();
          }

      });
  }
};
