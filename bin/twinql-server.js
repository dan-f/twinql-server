#!/usr/bin/env node

/**
 * Configure with the following environment variables:
 * - HOSTNAME (default null) - the hostname of this server; rejects requests for
 *   different hostnames
 * - PORT (default 8000) - the port to bind to
 * - REVERSE_PROXY_IP (default 'loopback') - the IP address(es) of reverse
 *   proxies to trust.  Accepts values specified here:
 *   https://expressjs.com/en/guide/behind-proxies.html
 * - FORWARD_PROXY_URI - The URI of the forward-facing Solid proxy
 */

const commander = require('commander')

const runTwinqlServer = require('../lib/server.js')
const npmConf = require('../package.json')

commander
  .version(npmConf.version)
  .usage('[options]')
  .option('-H, --hostname [value]', 'The hostname of this server')
  .option('-p, --port <n>', 'The port this server should run on', parseInt)
  .option(
    '-r, --reverse-proxy-ip [value]',
    'The trusted IP address of the reverse proxy.  ' +
    'Takes values accepted by https://expressjs.com/en/guide/behind-proxies.html'
  )
  .option('-f, --forward-proxy-uri [value]', 'The URI of the forward-facing Solid agent')
  .parse(process.argv)

runTwinqlServer(commander)
