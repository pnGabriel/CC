let Router = require('./router');
let ClientsAPI = require('../controller/clients');

let mainRouter = new Router();

ClientsAPI.init_routes(mainRouter);

module.exports = mainRouter;

