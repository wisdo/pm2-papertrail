## Description

PM2 module to forwards pm2 logs to [papertrail](https://papertrailapp.com/). You will need to use your Host and Port.

## Install

- `pm2 install pm2-papertrail`

## Configure

- `port` : Your host retrieved from papertrailapp.com
- `host` : Your port retrieved from papertrailapp.com

#### How to set this value ?

 After having installed the module you have to type :
- `pm2 set pm2-papertrail:host [your_host]`
- `pm2 set pm2-papertrail:port [your_port]`

 or go to the Keymetrics dashboard.

## Uninstall

- `pm2 uninstall pm2-papertrail`
