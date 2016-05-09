var Promise = require("bluebird");
var Channel = require("yy-channel");

function Scheduler(limit, sleep) {
    this.limit = limit || Number.MAX_VALUE;
    this.sleep = sleep || 0;
    this.wait = new Channel();

}

Scheduler.prototype.start = function() {

}

Scheduler.prototype.stop = function() {

}

Scheduler.prototype.terminal = function() {

}

Scheduler.prototype.exec = function() {

}
