var Promise = require("bluebird");
var Channel = require("yy-channel");

function defer(fn) {
    var ret = { fn: fn };
    var promise = new Promise(function(resolve, reject) {
        ret.resolve = resolve;
        ret.reject = reject;
    });
    ret.promise = promise;
    return ret;
}

function Scheduler(limit, sleep) {
    this.limit = limit || Number.MAX_VALUE;
    this.sleep = sleep || 0;
    this.runningTask = new Channel(limit);
    this.state = "terminal"; // "start", "stop"
    this.nextExecTime = 0;
}

Scheduler.prototype.running = function() {
    return this.runningTask.length();
}

Scheduler.prototype.start = function() {
    this.state = "start";
}

Scheduler.prototype.stop = function() {
    this.state = "stop";
    return this.promise();
}

Scheduler.prototype.terminal = function() {
    this.state = "terminal";
    return this.promise();
}

Scheduler.prototype.promise = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.runningTask.once("pop", function() {
            if (!that.runningTask.length()) {
                resolve();
            } else {
                that.runningTask.once("pop", arguments.callee);
            }
        })
    })
}

Scheduler.prototype.exec = function(fn) {
    if (this.state !== "start") {
        return Promise.reject(new Error("Scheduler Not Start"));
    }
    var that = this;
    return that.runningTask.push(fn).then(function() {
        if (that.state === "terminal") {
            throw new Error("Scheduler Terminal");
        }
    }).then(function() {
        var now = Date.now();
        if (now >= that.nextExecTime) {
            that.nextExecTime = now + that.sleep;
            return;
        }
        var gap = that.nextExecTime - now;
        that.nextExecTime += that.sleep;
        return Promise.delay(gap);
    }).then(function() {
        return fn();
    }).finally(function() {
        that.runningTask.pop().done();
    });
}

module.exports = Scheduler;
