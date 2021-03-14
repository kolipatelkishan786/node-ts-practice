"use strict";
const _ = require('lodash');
let logger = require('tracer').console();
let model = undefined;
let model_path = {
    ADMIN_Users: './src/models/admin/user.model',
};
let loader = {
    logger: logger,
    ADMIN_Users: undefined,
    loadAll: function () {
        console.log('Loading all modules started....');
        let myVar1 = setInterval(() => {
            let counter = 0;
            _.forOwn(loader, (value, key) => {
                if (_.size(loader[key]) > 0) {
                    counter++;
                }
                else {
                    if (key !== 'loadAll') {
                        loader[key] = require(model_path[key]);
                    }
                }
            });
            if (counter === _.size(loader) - 1) {
                console.log('Modules are loaded....');
                clearInterval(myVar1);
            }
        }, 1000);
    }
};
module.exports = loader;
