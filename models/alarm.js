
const _ = require('underscore');

class Alarm {

    constructor(data) {
        // put data object onto Alarm object
        _.extend(this, data);
    }
}

module.exports = Alarm;