'use strict';
var winston = require('winston');
require('winston-papertrail').Papertrail;
var pm2 = require('pm2');
var pmx = require('pmx');

pmx.initModule({
    widget: {
        logo: 'https://papertrail.global.ssl.fastly.net/images/pt-logo.svg?1482187727',
        theme: ['#141A1F', '#222222', '#3ff', '#3ff'],
        el: {
            probes: false,
            actions: false
        },
        block: {
            actions: false,
            issues: false,
            meta: false,
        }
    }
}, function(err, conf) {

    var loggerObj = {};
    var log = function(level, name, message, packet) {
        if (name === 'pm2-papertrail') {
            return;
        }
        if (!loggerObj[name]) {
            loggerObj[name] = createLogger(name);
        }
        loggerObj[name][level](message);
    };

    var createLogger = function(program) {
        return new (winston.Logger)({
            transports: [
                new (winston.transports.Papertrail)({
                    port: conf.port,
                    host: conf.host,
                    program: program,
                    colorize: true,
                    level: 'info'
                })
            ]
        });
    };

    pm2.connect(function() {
        console.log('info', 'PM2: forwarding to papertrail');
        pm2.launchBus(function(err, bus) {
            bus.on('log:PM2', function(packet) {
                //log('info', 'PM2', packet.data, packet);
            });
            bus.on('log:out', function(packet) {
                log('info', packet.process.name, packet.data, packet);
            });
            bus.on('log:err', function(packet) {
                log('error', packet.process.name, packet.data, packet);
            });
        });
    });
});
