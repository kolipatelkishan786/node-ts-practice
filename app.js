"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const strings = require("./strings");
const express = require("express");
const path = require("path");
const app = express();
const page_mappings = require("./src/page_mappings");
let logger = require('tracer').console();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json({ limit: '50mb' });
const restful = require('node-restful');
const mongoose = restful.mongoose;
mongoose.Promise = global.Promise;
let port = 2020;
mongoose.connect(process.env.CONNECTION_STRING, {
    promiseLibrary: Promise,
    useNewUrlParser: true,
    useFindAndModify: true,
}).then((out) => console.log("MongoDB Connected...."));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    parameterLimit: 9999999,
    extended: true,
    limit: '999mb'
}));
app.use(jsonParser);
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.text());
let appRoot = path.resolve(__dirname);
strings.setApp(app, appRoot);
const l = require("./loader");
l.loadAll();
const initialize = require("./intialize");
initialize.init();
page_mappings.loadMappings(app);
app.listen(port, function () {
    console.log('app listening on port:' + port);
});
