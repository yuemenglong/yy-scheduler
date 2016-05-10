var should = require("should");
var Scheduler = require("..")
var Promise = require("bluebird");

describe('Scheduler', function() {
    it('Finish All', function(done) {
        var scheduler = new Scheduler(10);
        scheduler.start();
        var i = 0;

        function func() {
            i++;
        }
        scheduler.exec(func).done(function() {});
        scheduler.exec(func).done(function() {});
        scheduler.exec(func).done(function() {});
        scheduler.exec(func).done(function() {});
        scheduler.exec(func).done(function() {});
        scheduler.stop().then(function() {
            scheduler.running().should.eql(0);
            i.should.eql(5);
            done();
        });
    });

    it('Limit', function(done) {
        var scheduler = new Scheduler(3);
        scheduler.start();
        cur = 0;

        function f() {
            return Promise.delay(100).then(function() {
                cur++;
                should(cur <= 3).be.ok;
                should(scheduler.running <= 3).be.ok;
            });
        }
        for (var i = 0; i < 10; i++) {
            scheduler.exec(f).done(function() {
                cur--;
                should(cur <= 3).be.ok;
            });
        }
        scheduler.stop().done(function() {
            done();
        })
    });
    it('Sleep', function(done) {
        var scheduler = new Scheduler(3, 100);
        scheduler.start();
        cur = 0;

        function f() {
            cur++;
        }
        for (var i = 0; i < 10; i++) {
            scheduler.exec(f).done(function() {
                // logger.log("ok");
            });
        }
        scheduler.stop().timeout(900).then(function() {
            should(true).eql(false);
        }).catch(function(err) {
            err.name.should.eql("TimeoutError");
            return scheduler.stop();
        }).then(function() {
            cur.should.eql(10);
            done();
        })
    });
});
