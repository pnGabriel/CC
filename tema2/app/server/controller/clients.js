'use strict';

let mongoose        = require('mongoose');
let Client          = require('../models/clients');
let utils           = require('../utils');

class ClientsAPI {

    //validate errors
    static check_validation_errors(req, res, newClient){
        if(newClient.hasOwnProperty("errors")){
            if(newClient.errors) {
                let rez = {};
                for(const err in newClient.errors){
                    if(newClient.errors[err].hasOwnProperty("message")) {
                        rez[err] = newClient.errors[err].message;
                    }
                }
                utils.send_json_data(req, res, 400, rez);
                return true;
            }
        }
        return false;
    }

    static getClients(req, res){
        let query = {};

        if(req.query !== undefined){
            query = req.query;
        }
        else if(req.body !== undefined){
            query = req.body
        }

        Client.find(query)
            .then(clients => {
                if(clients){
                    utils.send_json_data(req, res, 200, clients);
                }
                else{
                    utils.send_json_data(req, res, 200, {});
                }
            })
            .catch((err) => {
                utils.send_json_data(req, res, 500, {"Error": "Internal error"});
            });
    }

    static getClientById(req, res){
        let clientId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            utils.send_json_data(req, res, 404, {"Error" :"Invalid client id!"});
        }else{
            Client.findById({_id: mongoose.Types.ObjectId(clientId)})
                .then((client) => {
                    if(client){
                        utils.send_json_data(req, res, 200, client);
                    }
                    else{
                        utils.send_json_data(req, res, 404, {"Error" :"Invalid client id!"});
                    }
                })
                .catch((err) => {
                    utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                });

        }
    }

    static addClient(req, res){
        let newClient = Client(req.body);
        let error = newClient.validateSync();
        if(!error){
            newClient.save()
                .then((client) => {
                    res.writeHead(201, {'Content-Type': 'application/json', 'Location': '/clients/' + client._id});
                    res.end();
                })
                .catch((err) => {
                    if(!utils.check_duplicates(req, res, err)) {
                        utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                    }
                })
        }
        else{
            if(!ClientsAPI.check_validation_errors(req, res, newClient)) {
                utils.send_json_data(req, res, 400, {"Error": "Bad Request"});
            }
        }

    }

    static replaceClient(req, res) {
        let clientId = req.params.id;
        if(req.body === undefined){
            utils.send_json_data(req, res, 404, {"Error": "Invalid body!"});
        }
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            utils.send_json_data(req, res, 404, {"Error": "Invalid client id!"});
        } else {
            //TODO: refactor here
            Client.replaceOne(
                {_id: mongoose.Types.ObjectId(clientId)},
                req.body)
                .then((client) => {
                    if(client){
                        utils.send_json_data(req, res, 200, {});
                    }
                    else{
                        utils.send_json_data(req, res, 404, {"Error" :"Invalid client id!"});
                    }
                })
                .catch((err) => {
                    if (!utils.check_duplicates(req, res, err)) {
                        utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                    }
                })
        }
    }

    static updateClient(req, res) {
        let clientId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            utils.send_json_data(req, res, 404, {"Error": "Invalid client id!"});
        } else {
            Client.findOne({_id: mongoose.Types.ObjectId(clientId)})
                .then((client) => {
                    return Object.assign(client, req.body)
                })
                .then((model) => {
                    model.updated = new Date();
                    return model.save();
                })
                .then((updatedModel) => {
                    utils.send_json_data(req, res, 200, {});
                })
                .catch((err) => {
                    if (!utils.check_duplicates(req, res, err)) {
                        utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                    }
                })
        }
    }

    static deleteClient(req, res) {
        let clientId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            utils.send_json_data(req, res, 404, {"Error": "Invalid client id!"});
        } else {
            Client.findOne({_id: mongoose.Types.ObjectId(clientId)})
                .then((client) => {
                    if(client){
                        client.remove( (err) => {
                            if(err){
                                utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                            }
                            utils.send_json_data(req, res, 200, {});
                        })
                    }else{
                        utils.send_json_data(req, res, 404, {"Error": "Invalid client id!"});
                    }
                })
                .catch((err) => {
                    utils.send_json_data(req, res, 500, {"Error": "Internal error"});
                })

        }
    }

    static init_routes(router){
        //get user
        router.add('GET', '/clients', this.getClients);
        router.add('GET', '/clients/(.+)', this.getClientById);

        //add user
        router.add('POST', '/clients', this.addClient);
        router.add('POST', '/clients/(.+)', utils.errors.methodNotAllowed);

        //replace user
        router.add('PUT', '/clients', utils.errors.methodNotAllowed);
        router.add('PUT', '/clients/(.+)', this.replaceClient);

        //update user
        router.add('PATCH', '/clients', utils.errors.methodNotAllowed);
        router.add('PATCH', '/clients/(.+)', this.updateClient);

        //delete user
        router.add('DELETE', '/clients', utils.errors.methodNotAllowed);
        router.add('DELETE', '/clients/(.+)', this.deleteClient);

    }

}

module.exports = ClientsAPI;