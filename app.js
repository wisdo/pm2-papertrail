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
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Papertrail)({
                port: conf.port,
                ssl_enable: true,
                host: conf.host,
                max_connect_retries: -1,
                node_name: 'pm2 output',
            })
        ]
    });

    pm2.connect(function() {
        logger.log('info', 'PM2: forwarding to papertrail');
        console.log('info', 'PM2: forwarding to papertrail');
        pm2.launchBus(function(err, bus) {
            bus.on('log:PM2', function(packet) {
                logger.log('PM2: ' + packet.data);
            });
            bus.on('log:out', function(packet) {
                logger.log(packet.data, {app: packet.process.name});
            });
            bus.on('log:err', function(packet) {
                logger.error(packet.data, {app: packet.process.name});
            });
        });
    });
});
