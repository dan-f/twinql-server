const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const twinql = require('twinql')

module.exports = function runTwinqlServer ({
  hostname = null,
  port = 8000,
  reverseProxyIp = 'loopback',
  forwardProxyUri = ''
}) {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', reverseProxyIp)
  app.use(bodyParser.text())
  app.use(compression())

  app.post('/', (req, res, next) => {
    const backend = new twinql.LdpBackend({ proxyUri: forwardProxyUri })
    res.set('access-control-allow-origin', '*')
    res.set('vary', 'origin')
    return twinql.query(backend, req.body)
      .then(res.json.bind(res))
      .catch(next)
  })

  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(400).json({
      '@error': {
        type: err.name,
        message: err.message
      }
    })
  })

  app.listen(port, hostname, () => {
    console.log(
      '...twinql server listening on ' + (
        hostname
          ? `<http://${hostname}:${port}>`
          : `port ${port}`
      )
    )
  })
}
