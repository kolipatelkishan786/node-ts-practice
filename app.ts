import * as https from "https";
require('dotenv').config();
import * as strings from "./strings";
import * as express from "express";
import * as path from "path";
import * as fs from "fs";
const app = express();
import * as ejs from "ejs";
import * as moment from "moment";
import * as page_mappings from './src/page_mappings';

let logger = require('tracer').console();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json({limit: '50mb'});
const restful = require('node-restful');
const mongoose = restful.mongoose;
mongoose.Promise = global.Promise;
let port = 2020
mongoose.connect(process.env.CONNECTION_STRING, <any>{
    promiseLibrary: Promise,
    useNewUrlParser: true,
    useFindAndModify: true,

}).then((out) => console.log("MongoDB Connected...."));

// Allows CORS.
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

// :method :url :status :response-time ms - :res[content-length]
// app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs'); // extension can be html/ejs

// app.engine('ejs', ejs.renderFile); // ejs can be replaced by html it is extension in url.
app.use(express.static('public'));

// add post data parser and make them available in req.data using below code
app.use(bodyParser.urlencoded({
    parameterLimit: 9999999,
    extended: true,
    limit: '999mb'
}));
app.use(jsonParser);
app.use(bodyParser.json({type: 'application/*+json'}));
app.use(bodyParser.text());

let appRoot = path.resolve(__dirname);
strings.setApp(app, appRoot);
import * as l from './loader';

l.loadAll();

import * as initialize from './intialize';
import * as http from "http";


initialize.init();

page_mappings.loadMappings(app);
app.listen(port, function () {
    console.log('app listening on port:' + port);
});
