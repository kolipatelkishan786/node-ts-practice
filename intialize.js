"use strict";
const restful = require('node-restful');
const mongoose = restful.mongoose;
const strings = require('./strings');
const _ = require('lodash');
const async = require("async");
let logger = require('tracer').console();
const ADMIN_Users = require("./src/models/admin/user.model");
let initialize = {
    init: function () {
        let options = { upsert: true, new: true, setDefaultsOnInsert: true };
        mongoose.connection.on('connected', function () {
            console.log('Mongoose connected....');
            ADMIN_Users.findOne({ mobile_number: 9999999999 }, function (err, user) {
                if (err)
                    logger.error(err);
                if (user === undefined || user === null) {
                    ADMIN_Users.create({
                        "first_name": "Root",
                        "mobile_number": 9999999999,
                        "user_email": "root@root.com",
                        "user_password": "root"
                    }, function (err, user) {
                        if (err)
                            logger.error(err);
                        logger.error("ADMIN_Users root user created...." + user);
                    });
                }
                else {
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
        });
    },
};
module.exports = initialize;
