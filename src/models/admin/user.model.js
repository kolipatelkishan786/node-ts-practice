"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strings = require("../../../strings");
const json = require("pushjson");
const restful = require('node-restful'), mongoose = restful.mongoose;
let deepPopulate = require('mongoose-deep-populate')(mongoose);
let http = require('http');
let request = require('request');
let schema = mongoose.Schema({
    first_name: { type: String, trim: true },
    user_email: { type: String, trim: true, required: true },
    user_password: { type: String, trim: true },
    mobile_number: { type: Number, trim: true },
    active: { type: Number, default: 1 }
}, {
    timestamps: true
});
schema.index({ active: 1 });
let model = restful.model('ADMIN_Users', schema);
model.methods(['get', 'post', 'put', 'delete']);
schema.plugin(deepPopulate, {});
strings.bind_route_aggregate(model, json);
strings.bind_route_query(model, json);
strings.bind_route_distinct_field(model, json);
model.register(strings.app, '/api/admin/user');
module.exports = model;
