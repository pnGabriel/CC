'use strict';

let mongoose = require('mongoose');
let validator = require('validator');
let Schema = mongoose.Schema;

let clients_schema = Schema({
    name: {
        first: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        last: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        }
    },
    email: {
        type: String,
        required: [true, 'email is required!'],
        unique: [true, 'email exists!'],
        validate: {
            validator: validator.isEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    phone: {
        type: String,
        required: false,
        validate: {
            validator: validator.isMobilePhone,
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    created:{
        type: Date,
        required: true,
        default: new Date()
    },
    updated:{
        type: Date,
        required: true,
        default: new Date()
    }
});

let ClientsSchema = new mongoose.Schema(clients_schema,
    { collation: { locale: 'en_US', strength: 1 } });

// ClientsSchema.post('save', function(error, doc, next) {
//     if (error.name === 'MongoError' && error.code === 11000) {
//         next(new Error('Email used!'));
//     } else {
//         next(error);
//     }
// });

// CustomersSchema.set('autoIndex', false);
module.exports = mongoose.model('Clients', ClientsSchema);