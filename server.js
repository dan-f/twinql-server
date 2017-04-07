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

const bodyParser = require('body-parser')
const express = require('express')
const twinql = require('twinql')

let { HOSTNAME, PORT, FORWARD_PROXY_URI, REVERSE_PROXY_IP } = process.env
HOSTNAME = HOSTNAME || null
PORT = PORT || 8000
FORWARD_PROXY_URI = FORWARD_PROXY_URI || ''
REVERSE_PROXY_IP = REVERSE_PROXY_IP || 'loopback'

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', REVERSE_PROXY_IP)

app.use(bodyParser.text())

app.post('/', (req, res, next) => {
  const backend = new twinql.LdpBackend({ proxyUri: FORWARD_PROXY_URI })
  res.set('access-control-allow-origin', '*')
  res.set('vary', 'origin')
  return twinql.query(backend, req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err))
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(400).json({ '@error': err })
})

app.listen(PORT, HOSTNAME, () => {
  console.log(
    '...twinql server listening on ' + (
      HOSTNAME
        ? `<http://${HOSTNAME}:${PORT}>`
        : `port ${PORT}`
    )
  )
})
