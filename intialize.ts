/**
 * Created by mayur on 2/1/2017.
 */
const restful = require('node-restful');
const mongoose = restful.mongoose;
const strings = require('./strings');
const _ = require('lodash');
const async = require("async");
// const settings = require('./settings');
let logger = require('tracer').console();

import * as ADMIN_Users from './src/models/admin/user.model';

let initialize = {
    init: function () {
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};

        mongoose.connection.on('connected', function () {
            console.log('Mongoose connected....');

            // Prayosha DB data loading
            (<any>ADMIN_Users).findOne({mobile_number: 9999999999}, function (err, user) {
                if (err)
                    logger.error(err);
                if (user === undefined || user === null) {
                    (<any>ADMIN_Users).create({
                        "first_name": "Root",
                        "mobile_number": 9999999999,
                        "user_email": "root@root.com",
                        "user_password": "root"
                    }, function (err, user) {
                        if (err)
                            logger.error(err);
                        logger.error("ADMIN_Users root user created...." + user);
                    });
                } else {
                    logger.log("Admin User exists....");
                }
            });
        });

        mongoose.connection.on('connecting', function () {
            console.log('connecting to MongoDB...');
        });

        mongoose.connection.on('error', function (error) {
            console.error('Error in MongoDb connection: ' + error);
            mongoose.disconnect();
        });
        mongoose.connection.on('connected', function () {
            console.log('MongoDB connected!');
        });
        mongoose.connection.once('open', function () {
            console.log('MongoDB connection opened!');
        });
        mongoose.connection.on('reconnected', function () {
            console.log('MongoDB reconnected!');
        });
        mongoose.connection.on('disconnected', function () {
            console.log('MongoDB disconnected!');
            // No need for below line. It happens automatically.
            // setTimeout(function () {
            //     mongoose.connect(process.env.CONNECTION_STRING, {server: {auto_reconnect: true}});
            // }, 1000);
        });
    },

};

export = initialize;
