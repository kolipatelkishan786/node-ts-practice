"use strict";
const moment = require("moment");
const _ = require("lodash");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const json = require("pushjson");
let logger = require('tracer').console();
class strings {
    constructor() {
        this.app = null;
        this.em = undefined;
        this.date_time_format_user = 'DD-MM-YYYY hh:mm A';
        this.date_time_format_user_for_file = 'DD-MM-YYYY hh_mm A';
        this.date_format_user = 'DD-MM-YYYY';
        this.date_format_db = "YYYY-MM-DDTHH:mm:SS.000Z";
        this.regexMongoDBObjectId = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
        this.chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        this.chars_obj = {
            "0": "0",
            "1": "1",
            "2": "2",
            "3": "3",
            "4": "4",
            "5": "5",
            "6": "6",
            "7": "7",
            "8": "8",
            "9": "9",
            "A": "10",
            "B": "11",
            "C": "12",
            "D": "13",
            "E": "14",
            "F": "15",
            "G": "16",
            "H": "17",
            "I": "18",
            "J": "19",
            "K": "20",
            "L": "21",
            "M": "22",
            "N": "23",
            "O": "24",
            "P": "25",
            "Q": "26",
            "R": "27",
            "S": "28",
            "T": "29",
            "U": "30",
            "V": "31",
            "W": "32",
            "X": "33",
            "Y": "34",
            "Z": "35"
        };
    }
    setApp(app, appRoot) {
        this.app = app;
        this.appRoot = appRoot;
    }
    setEm(em) {
        this.em = em;
    }
    log_error(err) {
        console.log(err);
    }
    filter_data_from_conditions(source_data, columns_conditions) {
        let data = [];
        for (let data_item of source_data) {
            let add_item = false;
            for (let t of columns_conditions) {
                if (t.column.selected && t.column.inside_ref && t.column.type === "String") {
                    if (t.column.from_array) {
                        add_item = this.check_value_from_array(t, data_item, this.check_value_string);
                    }
                    else {
                        let value = _.get(data_item, t.column.db_name);
                        add_item = this.check_value_string(t, value);
                    }
                }
                else if (t.column.selected && t.column.inside_ref && t.column.type === "Date") {
                    if (t.column.from_array) {
                        add_item = this.check_value_from_array(t, data_item, this.check_value_date);
                    }
                    else {
                        let value = _.get(data_item, t.column.db_name);
                        add_item = this.check_value_date(t, value);
                    }
                }
                else if (t.column.selected && t.column.inside_ref && t.column.type === "Number") {
                    if (t.column.from_array) {
                        add_item = this.check_value_from_array(t, data_item, this.check_value_number);
                    }
                    else {
                        let value = _.get(data_item, t.column.db_name);
                        add_item = this.check_value_number(t, value);
                    }
                }
                else {
                    add_item = true;
                }
                if (add_item === false) {
                    break;
                }
            }
            if (add_item === true) {
                data.push(data_item);
            }
            else if (add_item === false && columns_conditions && columns_conditions.length === 0) {
                data.push(data_item);
            }
        }
        return data;
    }
    check_value_from_array(t, row, check_value_fun) {
        let add_item = false;
        let last_index = t.column.db_name.lastIndexOf(".");
        let col_main = t.column.db_name.substr(0, last_index);
        let col_end = t.column.db_name.substr(last_index + 1);
        let arr = _.get(row, col_main, []);
        let arr_map = _.map(arr, col_end);
        for (let a of arr_map) {
            add_item = check_value_fun(t, a);
            if (add_item) {
                break;
            }
        }
        return add_item;
    }
    check_value_string(t, value) {
        let add_item = false;
        if (t.operation === "Contains") {
            if (value && (new RegExp(`.*(${t.value}).*`, "i")).test(value)) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        else if (t.operation === "Equals") {
            if (value && value.toString() === t.value) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        return add_item;
    }
    check_value_date(t, value) {
        let add_item = false;
        if (t.operation === "Equals") {
            let startDate = moment(t.value, this.date_format_user).startOf('day').toDate();
            let dateMidnight = moment(startDate).endOf('day').toDate();
            if (value >= startDate && value <= dateMidnight) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        else if (t.operation === "Range") {
            let startDate = moment(t.value, this.date_format_user).startOf('day').toDate();
            let dateMidnight = moment(t.value_end, this.date_format_user).endOf('day').toDate();
            if (value >= startDate && value <= dateMidnight) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        return add_item;
    }
    check_value_number(t, value) {
        let add_item = false;
        if (t.operation === "Equals") {
            if (value !== undefined && t.value !== undefined && value === Number(t.value)) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        else if (t.operation === "Range") {
            if (value !== undefined && t.value !== undefined && t.value_end !== undefined && value >= Number(t.value) && value <= Number(t.value_end)) {
                add_item = true;
            }
            else {
                add_item = false;
            }
        }
        return add_item;
    }
    bind_route_delete_query(model, json) {
        model.route('delete_query.post', function (req, res, next) {
            model.find(req.body).remove().exec();
            json.Readable({}, null).pipe(res);
        });
    }
    bind_route_distinct_field(model, json) {
        model.route('distinct_field.post', function (req, res, next) {
            model.find(req.body.query).distinct(req.body.field, function (error, items) {
                if (error) {
                    logger.log(error);
                    json.Readable(error, null).pipe(res);
                }
                else {
                    json.Readable(items, null).pipe(res);
                }
            });
        });
    }
    bind_route_query(model, json, processFun) {
        model.route('query.post', (req, res, next) => {
            model.find(req.body.query, req.body.query2).limit(req.body.limit).select(req.body.select).sort(req.body.sort).deepPopulate(req.body.deep, req.body.deep_options).lean().exec((err, items) => {
                if (err) {
                    logger.log(err);
                    json.Readable(err, null).pipe(res);
                }
                else {
                    let data = [];
                    if (req.body.columns_conditions) {
                        data = this.filter_data_from_conditions(items, req.body.columns_conditions);
                    }
                    else {
                        data = items;
                    }
                    if (processFun)
                        processFun(data);
                    json.Readable(data, null).pipe(res);
                }
            });
        });
    }
    bind_route_aggregate(model, json) {
        model.route('aggregate.post', (req, res, next) => {
            this.assignNormalIdToObjectId(req.body);
            model.aggregate(req.body).exec((err, data) => {
                if (err) {
                    logger.log(err);
                    json.Readable(err, null).pipe(res);
                }
                else {
                    json.Readable(data, null).pipe(res);
                }
            });
        });
    }
    bind_database_update_event(model, model_name) {
        model.after('put', (req, res, next) => {
            if (res.locals.status_code === 200) {
                let old_doc = res.locals.bundle;
                let new_doc = res.req.body;
                this.em.emit(`Database_Event_Update`, model_name, old_doc, new_doc);
            }
            next();
        });
    }
    bind_database_save_event(model, model_name) {
        model.after('post', (req, res, next) => {
            if (res.locals.status_code === 201) {
                let saved_doc = res.locals.bundle;
                this.em.emit(`Database_Event_Save`, model_name, saved_doc);
            }
            next();
        });
    }
    bind_database_before_delete_event(model, model_name) {
        model.before('delete', (req, res, next) => {
            let id = req.params.id;
            model.findOne({ _id: id }, function (err, about_to_delete_obj) {
                req.params._deleted_obj = about_to_delete_obj;
                next();
            });
        });
    }
    bind_database_delete_event(model, model_name) {
        model.after('delete', (req, res, next) => {
            if (res.locals.status_code === 204) {
                this.em.emit(`Database_Event_Delete`, model_name, req.params._deleted_obj);
            }
            next();
        });
    }
    send_success_response(res, message, data) {
        json.Readable({
            success: true,
            message: message,
            data: data
        }, null).pipe(res);
    }
    send_fail_response(res, message) {
        json.Readable({
            success: false,
            message: message
        }, null).pipe(res);
    }
    order_no_get_length(num) {
        let counter = 0;
        let temp_num = num;
        while (Math.pow(36, counter) <= num) {
            counter++;
        }
        return counter - 1;
    }
    order_no_num_to_str(num) {
        let str = "";
        let length = this.order_no_get_length(num);
        let d2 = 0;
        let diff = 0;
        while (num > 35) {
            d2 = Math.floor(num / Math.pow(36, length));
            diff = num - (Math.pow(36, length) * d2);
            str += this.chars[d2];
            num = diff;
            length--;
        }
        str += this.chars[num];
        return str;
    }
    order_no_str_to_num(str) {
        let num = 0;
        let char = "";
        let temp_num = 0;
        let length = str.length - 1;
        if (str && str.length > 0) {
            while (str.length > 0) {
                char = str.substr(0, 1);
                str = str.substring(1);
                temp_num = this.chars_obj[char];
                num = num + (temp_num * Math.pow(36, length));
                length--;
            }
        }
        return num;
    }
    assignNormalIdToObjectId(obj) {
        if (obj instanceof Array) {
            for (let tempObj of obj) {
                this.assignNormalIdToObjectId(tempObj);
            }
        }
        else if (typeof obj === "object") {
            for (const field in obj) {
                if (!obj.hasOwnProperty(field)) {
                    continue;
                }
                if (typeof obj[field] === "string" && this.regexMongoDBObjectId.test(obj[field]) && mongodb.ObjectId.isValid(obj[field])) {
                    obj[field] = mongoose.Types.ObjectId(obj[field]);
                    continue;
                }
                if (obj[field] instanceof Array) {
                    let tempArr = [];
                    let foundObjectIdArr = false;
                    for (let item of obj[field]) {
                        if (this.regexMongoDBObjectId.test(item) && mongodb.ObjectId.isValid(item)) {
                            foundObjectIdArr = true;
                            tempArr.push(mongoose.Types.ObjectId(item));
                        }
                    }
                    if (foundObjectIdArr) {
                        obj[field] = tempArr;
                    }
                    continue;
                }
                if (typeof obj[field] === "object") {
                    this.assignNormalIdToObjectId(obj[field]);
                }
            }
        }
    }
}
let temp = new strings();
var DBType;
(function (DBType) {
    DBType["String"] = "String";
    DBType["Number"] = "Number";
    DBType["Date"] = "Date";
    DBType["Ref"] = "Ref";
})(DBType || (DBType = {}));
var Operation;
(function (Operation) {
    Operation["Contains"] = "Contains";
    Operation["Equals"] = "Equals";
    Operation["Range"] = "Range";
    Operation["Single"] = "Single";
})(Operation || (Operation = {}));
module.exports = temp;
