'use strict';
const winston = require('winston');
require('winston-papertrail').Papertrail;
const pm2 = require('pm2');
const pmx = require('pmx');
const os = require("os");

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
}, function (err, conf) {
    const loggerObj = {};
    const log = function (level, name, message, packet) {
        name = name.trim();
        if (name === 'pm2-papertrail' || name === 'pm2-auto-pull') {
            return;
        }
        if (!loggerObj[name]) {
            loggerObj[name] = createLogger(name);
        }
        loggerObj[name][level](message);
    };

    const createLogger = function (program) {
        return new (winston.Logger)({
            transports: [
                new (winston.transports.Papertrail)({
                    port: conf.port,
                    host: conf.host,
                    hostname: `${conf.name}_${process.env.NODE_ENV}_${os.hostname()}`,
                    program: program,
                    colorize: true,
                    level: 'info'
                })
            ]
        });
    };

    pm2.connect(function () {
        console.log('info', 'PM2: forwarding to papertrail');
        pm2.launchBus(function (err, bus) {
            bus.on('log:out', function (packet) {
                log('info', packet.process.name, packet.data, packet);
            });
            bus.on('log:err', function (packet) {
                log('error', packet.process.name, packet.data, packet);
            });
        });
    });
});
